package services

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/clients/google"
	"github.com/tinyautomator/tinyautomator-core/backend/clients/redis"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
	"golang.org/x/oauth2"
	"google.golang.org/api/calendar/v3"
)

const (
	maxKeywords    = 20
	minTimeMinutes = 1
)

var (
	maxTimeMinutes = int(time.Hour.Minutes() * 24 * 7 * 4) // 4 weeks

	ErrSyncTokenExpired = errors.New("sync token expired")
)

type WorkflowCalendarService struct {
	logger logrus.FieldLogger
	wg     sync.WaitGroup

	workflowCalendarRepo    models.WorkflowCalendarRepository
	orchestrator            models.OrchestratorService
	oauthIntegrationService models.OauthIntegrationService
	oauthConfig             *oauth2.Config
	redisClient             redis.RedisClient
}

func NewWorkflowCalendarService(cfg models.AppConfig) models.WorkflowCalendarService {
	return &WorkflowCalendarService{
		logger:                  cfg.GetLogger(),
		workflowCalendarRepo:    cfg.GetWorkflowCalendarRepository(),
		orchestrator:            cfg.GetOrchestratorService(),
		oauthIntegrationService: cfg.GetOauthIntegrationService(),
		oauthConfig:             cfg.GetGoogleOAuthConfig(),
		redisClient:             cfg.GetRedisClient(),
	}
}

func (s *WorkflowCalendarService) InitCalendarClient(
	ctx context.Context,
	userID string,
) (*google.CalendarClient, error) {
	token, err := s.oauthIntegrationService.GetToken(ctx, userID, "google", s.oauthConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to get oauth integration: %w", err)
	}

	client, err := google.InitCalendarClient(ctx, token, s.oauthConfig, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to init calendar client: %w", err)
	}

	return client, nil
}

func (s *WorkflowCalendarService) EnsureInFlightEnqueued() {
	s.logger.Info("waiting for in-flight calendar checks to finish...")
	s.wg.Wait()
	s.logger.Info("calendar checks in flight enqueued successfully")
}

func (s *WorkflowCalendarService) ValidateCalendarConfig(
	config models.WorkflowCalendarConfig,
) error {
	_, ok := models.EventStatuses[string(config.EventStatusCondition)]
	if !ok {
		return errors.New("invalid event status condition")
	}

	if len(config.Keywords) > maxKeywords {
		return errors.New("keywords must be less than 20")
	}

	esc := config.EventStatusCondition
	timeSpecificStatus := esc == models.EventStatusStarting || esc == models.EventStatusEnding

	if config.TimeCondition == nil && timeSpecificStatus {
		return errors.New("time condition is required for time specific events")
	}

	if config.TimeCondition != nil && !timeSpecificStatus {
		return errors.New("time condition should be empty for non-time specific events")
	}

	if config.TimeCondition != nil {
		minutes := *config.TimeCondition
		if minutes < minTimeMinutes {
			return errors.New("time_condition must be at least 1 minute")
		}

		if minutes > maxTimeMinutes {
			return errors.New("time_condition must be less than 4 weeks")
		}
	}

	return nil
}

func (s *WorkflowCalendarService) GetActiveCalendars(
	ctx context.Context,
) ([]*models.WorkflowCalendar, error) {
	calendars, err := s.workflowCalendarRepo.GetActiveWorkflowCalendarsLocked(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get active calendars: %w", err)
	}

	return calendars, nil
}

func (s *WorkflowCalendarService) GetSyncToken(
	ctx context.Context,
	calendarID string,
	userID string,
) (*string, error) {
	client, err := s.InitCalendarClient(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to init calendar client: %w", err)
	}

	token, err := client.GetSyncToken(ctx, calendarID)
	if err != nil {
		return nil, fmt.Errorf("failed to get sync token: %w", err)
	}

	return &token, nil
}

func (s *WorkflowCalendarService) CreateWorkflowCalendar(
	ctx context.Context,
	workflowID int32,
	userID string,
	config models.WorkflowCalendarConfig,
) (*models.WorkflowCalendar, error) {
	syncToken, err := s.GetSyncToken(ctx, *config.CalendarID, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get sync token: %w", err)
	}

	if syncToken == nil {
		emptySyncToken := ""
		syncToken = &emptySyncToken
	}

	executionState := "queued"
	lastSyncedAt := time.Now().UnixMilli()

	calendar, err := s.workflowCalendarRepo.CreateWorkflowCalendar(
		ctx,
		workflowID,
		config,
		*syncToken,
		executionState,
		lastSyncedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create workflow calendar: %w", err)
	}

	return calendar, nil
}

func (s *WorkflowCalendarService) UpdateWorkflowCalendar(
	ctx context.Context,
	workflowID int32,
	config models.WorkflowCalendarConfig,
	syncToken string,
	executionState string,
	lastSyncedAt time.Time,
) error {
	if err := s.ValidateCalendarConfig(config); err != nil {
		return fmt.Errorf("failed to validate calendar config: %w", err)
	}

	err := s.workflowCalendarRepo.UpdateWorkflowCalendar(
		ctx,
		workflowID,
		config,
		syncToken,
		executionState,
		lastSyncedAt.UnixMilli(),
	)
	if err != nil {
		return fmt.Errorf("failed to update workflow calendar: %w", err)
	}

	return nil
}

func (s *WorkflowCalendarService) CheckEventChanges(
	ctx context.Context,
	c *models.WorkflowCalendar,
) error {
	errChan := make(chan error, 1)
	done := make(chan struct{})

	s.wg.Add(1)

	go func() {
		defer s.wg.Done()
		defer close(errChan)
		defer close(done)

		select {
		case <-ctx.Done():
			errChan <- ctx.Err()
			return
		default:
			err := s.checkEventChanges(ctx, c)
			errChan <- err
		}
	}()

	select {
	case err := <-errChan:
		return err
	case <-ctx.Done():
		<-done
		return fmt.Errorf("context cancelled: %w", ctx.Err())
	}
}

func (s *WorkflowCalendarService) checkEventChanges(
	ctx context.Context,
	c *models.WorkflowCalendar,
) error {
	if err := s.ValidateCalendarConfig(c.Config); err != nil {
		return fmt.Errorf("failed to validate calendar config: %w", err)
	}

	// Handle sync token expiration
	if c.SyncToken == "" {
		syncToken, err := s.GetSyncToken(ctx, *c.Config.CalendarID, c.UserID)
		if err != nil {
			return fmt.Errorf("failed to get sync token: %w", err)
		}

		if syncToken != nil && *syncToken != "" {
			c.SyncToken = *syncToken
		} else {
			return ErrSyncTokenExpired
		}
	}

	client, err := s.InitCalendarClient(ctx, c.UserID)
	if err != nil {
		return fmt.Errorf("failed to init calendar client: %w", err)
	}

	esc := c.Config.EventStatusCondition
	timeBasedTrigger := esc == models.EventStatusStarting || esc == models.EventStatusEnding

	now := time.Now().UTC()

	var events *calendar.Events

	if timeBasedTrigger {
		var timeMin, timeMax time.Time

		if esc == models.EventStatusStarting {
			minutes := time.Duration(*c.Config.TimeCondition) * time.Minute
			timeMin = now
			timeMax = now.Add(minutes)
		} else { // EventStatusEnding
			minutes := time.Duration(*c.Config.TimeCondition) * time.Minute
			timeMin = now.Add(-(minutes))
			timeMax = now.Add((minutes))
		}

		events, err = client.GetEventsByTimeRange(ctx, *c.Config.CalendarID, timeMin, timeMax)
		if err != nil {
			return fmt.Errorf("failed to get events by time range: %w", err)
		}
	} else {
		events, err = client.GetEventsBySyncToken(ctx, *c.Config.CalendarID, c.SyncToken)
		if err != nil {
			// If we get a 410 Gone response, we need to reset the sync token
			if strings.Contains(err.Error(), "410") {
				c.SyncToken = ""
				return ErrSyncTokenExpired
			}

			return fmt.Errorf("failed to get events by sync token: %w", err)
		}
	}

	s.logger.WithFields(logrus.Fields{
		"workflow_id":      c.WorkflowID,
		"calendar_id":      c.Config.CalendarID,
		"sync_token":       c.SyncToken,
		"number_of_events": len(events.Items),
	}).Info("Got events to process")

	var triggerEvent *calendar.Event

	for _, event := range events.Items {
		shouldTrigger, err := s.shouldTriggerWorkflow(c, event)
		if err != nil {
			s.logger.WithError(err).WithFields(logrus.Fields{
				"workflow_id": c.WorkflowID,
				"event_id":    event.Id,
			}).Error("failed to check if event should trigger workflow")

			continue
		}
		// TODO: For future blob storage we should return all the events that match the criteria
		if shouldTrigger {
			var ttl time.Duration

			if timeBasedTrigger {
				minutes := *c.Config.TimeCondition
				ttl = time.Duration(minutes) * time.Minute
			} else {
				// TODO: handle non-time based triggers
				ttl = 24 * time.Hour
			}

			claimed, err := s.redisClient.TryEventClaim(ctx, c.WorkflowID, event.Id, ttl)
			if err != nil {
				s.logger.WithError(err).WithFields(logrus.Fields{
					"workflow_id": c.WorkflowID,
					"event_id":    event.Id,
				}).Error("failed to claim calendar event")

				continue
			}

			if !claimed {
				continue
			}

			triggerEvent = event

			break
		}
	}

	if triggerEvent != nil {
		if triggerEvent.Start != nil && triggerEvent.End != nil {
			s.logger.WithFields(logrus.Fields{
				"event_id":     triggerEvent.Id,
				"event_title":  triggerEvent.Summary,
				"event_status": triggerEvent.Status,
				"event_start":  triggerEvent.Start.DateTime,
				"event_end":    triggerEvent.End.DateTime,
			}).Info("event that has triggered the workflow")
		}
		// TODO: IDK how long it should take to do this part...
		timeoutCtx, cancel := context.WithTimeout(ctx, 2*time.Minute)
		defer cancel()

		runID, err := s.orchestrator.OrchestrateWorkflow(timeoutCtx, c.UserID, c.WorkflowID)
		if err != nil || runID == -1 {
			return fmt.Errorf("workflow execution failed for event %s: %w", triggerEvent.Id, err)
		}

		s.logger.WithFields(logrus.Fields{
			"workflow_id": c.WorkflowID,
			"event_id":    triggerEvent.Id,
			"run_id":      runID,
		}).Info("workflow execution started successfully")
	} else {
		s.logger.WithFields(logrus.Fields{
			"workflow_id": c.WorkflowID,
		}).Info("no events matched trigger criteria")
	}

	lastSyncedAt := now.UnixMilli()
	c.ExecutionState = "queued"
	nextSyncToken := events.NextSyncToken

	if err := s.workflowCalendarRepo.UpdateWorkflowCalendar(ctx, c.WorkflowID, c.Config, nextSyncToken, c.ExecutionState, lastSyncedAt); err != nil {
		return fmt.Errorf("failed to update workflow calendar: %w", err)
	}

	return nil
}

func (s *WorkflowCalendarService) shouldTriggerWorkflow(
	c *models.WorkflowCalendar,
	event *calendar.Event,
) (bool, error) {
	if !matchesKeywords(event, c.Config.Keywords) {
		return false, nil
	}

	if c.Config.EventStatusCondition != models.EventStatusCancelled && event.Status == "cancelled" {
		return false, nil
	}

	if c.Config.EventStatusCondition == models.EventStatusCancelled && event.Status != "cancelled" {
		return false, nil
	}

	if c.Config.TimeCondition != nil {
		minutes := *c.Config.TimeCondition

		var eventTime string

		var isStartCondition bool

		if c.Config.EventStatusCondition == models.EventStatusStarting {
			isStartCondition = true

			// TODO: Handle all-day events
			if event.Start != nil && event.Start.DateTime != "" {
				eventTime = event.Start.DateTime
			} else {
				return false, nil
			}
		} else { // EventStatusEnding
			isStartCondition = false

			if event.End != nil && event.End.DateTime != "" {
				eventTime = event.End.DateTime
			} else {
				return false, nil
			}
		}

		eventTimeParsed, err := time.Parse(time.RFC3339, eventTime)
		if err != nil {
			return false, fmt.Errorf("failed to parse event time: %w", err)
		}

		eventTimeParsed = eventTimeParsed.UTC()
		now := time.Now().UTC()

		if isStartCondition {
			triggerStart := eventTimeParsed.Add(-time.Duration(minutes) * time.Minute)
			if !now.After(triggerStart) || !now.Before(eventTimeParsed) {
				return false, nil
			}
		} else {
			triggerEnd := eventTimeParsed.Add(time.Duration(minutes) * time.Minute)
			if !now.After(eventTimeParsed) || !now.Before(triggerEnd) {
				return false, nil
			}
		}
	}

	return true, nil
}

func matchesKeywords(event *calendar.Event, keywords []string) bool {
	if len(keywords) == 0 {
		return true
	}

	lowerKeywords := make([]string, len(keywords))
	for i, kw := range keywords {
		lowerKeywords[i] = strings.ToLower(kw)
	}

	var builder strings.Builder

	estimatedSize := len(event.Summary) + len(event.Description) + len(event.Location) +
		len(event.Attendees)*50
	builder.Grow(estimatedSize + 100)

	fields := []string{
		event.Summary,
		event.Description,
		event.Location,
	}

	if event.Organizer != nil {
		fields = append(fields, event.Organizer.DisplayName, event.Organizer.Email)
	}

	for _, attendee := range event.Attendees {
		fields = append(fields, attendee.DisplayName, attendee.Email)
	}

	for _, field := range fields {
		if field != "" {
			builder.WriteString(field)
			builder.WriteByte(' ')
		}
	}

	searchableText := strings.ToLower(builder.String())

	for _, keyword := range lowerKeywords {
		if !strings.Contains(searchableText, keyword) {
			return false
		}
	}

	return true
}
