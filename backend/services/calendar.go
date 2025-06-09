package services

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/golang-module/carbon/v2"
	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/clients/google"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
	"golang.org/x/oauth2"
	"google.golang.org/api/calendar/v3"
)

type WorkflowCalendarService struct {
	logger logrus.FieldLogger
	wg     sync.WaitGroup

	workflowCalendarRepo    models.WorkflowCalendarRepository
	orchestrator            models.OrchestratorService
	oauthIntegrationService models.OauthIntegrationService
	oauthConfig             *oauth2.Config
}

func NewWorkflowCalendarService(cfg models.AppConfig) models.WorkflowCalendarService {
	return &WorkflowCalendarService{
		logger:                  cfg.GetLogger(),
		workflowCalendarRepo:    cfg.GetWorkflowCalendarRepository(),
		orchestrator:            cfg.GetOrchestratorService(),
		oauthIntegrationService: cfg.GetOauthIntegrationService(),
	}
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

	if len(config.Keywords) > 20 {
		return errors.New("keywords must be less than 20")
	}

	timeSpecificStatus := config.EventStatusCondition == models.EventStatusStarting ||
		config.EventStatusCondition == models.EventStatusEnding

	if config.TimeCondition == nil && timeSpecificStatus {
		return errors.New("time condition is required for time specific events")
	}

	if config.TimeCondition != nil && *config.TimeCondition == "" && timeSpecificStatus {
		return errors.New("time condition is empty for time specific events")
	}

	if config.TimeCondition != nil {
		minutes, err := strconv.Atoi(*config.TimeCondition)
		if err != nil {
			return errors.New("time_condition must be a valid number of minutes")
		}

		if minutes < 1 {
			return errors.New("time_condition must be at least 1 minute")
		}

		if minutes > int(time.Hour.Minutes()*24*7*4) {
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
	token, err := s.oauthIntegrationService.GetToken(ctx, userID, "google", s.oauthConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to get oauth integration: %w", err)
	}

	client, err := google.InitCalendarClient(ctx, token, s.oauthConfig, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to init calendar client: %w", err)
	}

	syncToken, err := client.GetSyncToken(ctx, calendarID)
	if err != nil {
		return nil, fmt.Errorf("failed to get calendar list: %w", err)
	}

	return &syncToken, nil
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

	s.wg.Add(1)

	go func() {
		defer s.wg.Done()
		defer close(errChan)

		if err := s.checkEventChanges(ctx, c); err != nil {
			errChan <- fmt.Errorf("failed to check event changes: %w", err)
		}
	}()

	return <-errChan
}

func (s *WorkflowCalendarService) checkEventChanges(
	ctx context.Context,
	c *models.WorkflowCalendar,
) error {
	if err := s.ValidateCalendarConfig(c.Config); err != nil {
		return fmt.Errorf("failed to validate calendar config: %w", err)
	}

	if c.SyncToken == "" && time.Since(c.LastSyncedAt) < 2*time.Hour {
		return nil
	}

	if c.SyncToken == "" {
		syncToken, err := s.GetSyncToken(ctx, *c.Config.CalendarID, c.UserID)
		if err != nil {
			return fmt.Errorf("failed to get sync token: %w", err)
		}

		if syncToken != nil && *syncToken != "" {
			c.SyncToken = *syncToken
		} else {
			return fmt.Errorf("failed to get new sync token after 2 hours")
		}
	}

	token, err := s.oauthIntegrationService.GetToken(ctx, c.UserID, "google", s.oauthConfig)
	if err != nil {
		return fmt.Errorf("failed to get oauth integration: %w", err)
	}

	client, err := google.InitCalendarClient(ctx, token, s.oauthConfig, c.UserID)
	if err != nil {
		return fmt.Errorf("failed to init calendar client: %w", err)
	}

	events, err := client.GetEventsBySyncToken(ctx, *c.Config.CalendarID, c.SyncToken)
	if err != nil {
		return fmt.Errorf("failed to check for event changes: %w", err)
	}

	s.logger.WithFields(logrus.Fields{
		"workflow_id":      c.WorkflowID,
		"calendar_id":      c.Config.CalendarID,
		"sync_token":       c.SyncToken,
		"number_of_events": len(events.Items),
	}).Info("Got events to process")

	var triggerEvent *calendar.Event

	for _, event := range events.Items {
		shouldTrigger, err := shouldTriggerWorkflow(c, event)
		if err != nil {
			return fmt.Errorf("failed to check if event should trigger workflow: %w", err)
		}
		// TODO: For future blob storage we should return all the events that match the criteria
		if shouldTrigger {
			triggerEvent = event
			break
		}
	}

	if triggerEvent != nil {
		s.logger.WithFields(logrus.Fields{
			"workflow_id": c.WorkflowID,
			"event_id":    triggerEvent.Id,
			"event_title": triggerEvent.Summary,
		}).Info("Triggering workflow for calendar event")

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
			"workflow_id":      c.WorkflowID,
			"number_of_events": len(events.Items),
		}).Debug("no events matched trigger criteria")
	}

	now := time.Now().UnixMilli()
	c.ExecutionState = "queued"

	if err := s.workflowCalendarRepo.UpdateWorkflowCalendar(ctx, c.WorkflowID, c.Config, c.SyncToken, c.ExecutionState, now); err != nil {
		return fmt.Errorf("failed to update workflow calendar: %w", err)
	}

	return nil
}

func shouldTriggerWorkflow(c *models.WorkflowCalendar, event *calendar.Event) (bool, error) {
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
		minutes, err := strconv.Atoi(*c.Config.TimeCondition)
		if err != nil {
			return false, fmt.Errorf("failed to convert time condition to minutes: %w", err)
		}

		var eventTime string

		var isStartCondition bool

		// Skip all-day events for time-based triggers
		if c.Config.EventStatusCondition == models.EventStatusStarting {
			isStartCondition = true

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

		carbonEventTime := carbon.Parse(eventTime, "UTC")
		if carbonEventTime.IsZero() {
			return false, fmt.Errorf("failed to parse event time: %s", eventTime)
		}

		now := carbon.Now()

		if isStartCondition {
			triggerStart := carbonEventTime.SubMinutes(minutes)
			if !now.Between(triggerStart, carbonEventTime) {
				return false, nil
			}
		} else {
			triggerEnd := carbonEventTime.AddMinutes(minutes)
			if !now.Between(carbonEventTime, triggerEnd) {
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

	var textParts []string

	if event.Summary != "" {
		textParts = append(textParts, event.Summary)
	}

	if event.Description != "" {
		textParts = append(textParts, event.Description)
	}

	if event.Location != "" {
		textParts = append(textParts, event.Location)
	}

	for _, attendee := range event.Attendees {
		if attendee.DisplayName != "" {
			textParts = append(textParts, attendee.DisplayName)
		}

		if attendee.Email != "" {
			textParts = append(textParts, attendee.Email)
		}
	}

	if event.Organizer != nil {
		if event.Organizer.DisplayName != "" {
			textParts = append(textParts, event.Organizer.DisplayName)
		}

		if event.Organizer.Email != "" {
			textParts = append(textParts, event.Organizer.Email)
		}
	}

	searchableText := strings.ToLower(strings.Join(textParts, " "))

	for _, keyword := range keywords {
		if !strings.Contains(searchableText, strings.ToLower(keyword)) {
			return false
		}
	}

	return true
}
