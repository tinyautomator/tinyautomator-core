package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/golang-module/carbon/v2"
	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/clients/google"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
	"golang.org/x/oauth2"
	"google.golang.org/api/calendar/v3"
	"google.golang.org/api/option"
)

type StartTimingType string

const (
	Immediate StartTimingType = "immediate"
	Tomorrow  StartTimingType = "tomorrow"
	Custom    StartTimingType = "custom"
)

type StartTiming struct {
	Type StartTimingType `json:"type"`
	Days *int            `json:"days,omitempty"`
	Time *string         `json:"time,omitempty"`
}

type Duration struct {
	IsAllDay bool `json:"isAllDay"`
	Minutes  *int `json:"minutes,omitempty"`
}

type EventSchedule struct {
	Start    StartTiming `json:"start"`
	Duration Duration    `json:"duration"`
	TimeZone string      `json:"timeZone"`
}

type HandlerEventConfig struct {
	CalendarID  *string       `json:"calendarID,omitempty"`
	Schedule    EventSchedule `json:"eventSchedule"`
	Summary     *string       `json:"summary,omitempty"`
	Description *string       `json:"description,omitempty"`
	Attendees   []string      `json:"attendees,omitempty"`
	Location    *string       `json:"location,omitempty"`
	Reminders   bool          `json:"reminders"`
}

type CreateEventHandler struct {
	logger       logrus.FieldLogger
	oauthConfig  *oauth2.Config
	oauthService models.OauthIntegrationService
}

func NewCreateEventHandler(
	cfg models.AppConfig,
) ActionHandler {
	return &CreateEventHandler{
		logger:       cfg.GetLogger(),
		oauthConfig:  cfg.GetGoogleOAuthConfig(),
		oauthService: cfg.GetOauthIntegrationService(),
	}
}

func ExtractEventConfig(input ActionNodeInput) (*HandlerEventConfig, error) {
	v, err := json.Marshal(input.Config)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal config: %w", err)
	}

	var config HandlerEventConfig
	if err := json.Unmarshal(v, &config); err != nil {
		return nil, fmt.Errorf("failed to unmarshal config: %w", err)
	}

	return &config, nil
}

const (
	primaryCalendarID = "primary"
)

func (h *CreateEventHandler) Execute(
	ctx context.Context,
	userID string,
	input ActionNodeInput,
) error {
	eventConfig, err := ExtractEventConfig(input)
	if err != nil {
		return fmt.Errorf("failed to extract event config: %w", err)
	}

	startDate, endDate, err := ParseAndValidateEventSchedule(eventConfig.Schedule)
	if err != nil {
		return fmt.Errorf("failed to parse event schedule: %w", err)
	}

	googleEventConfig := &models.EventConfig{
		Description: eventConfig.Description,
		Location:    eventConfig.Location,
		Attendees:   eventConfig.Attendees,
		TimeZone:    &eventConfig.Schedule.TimeZone,
		StartDate:   *startDate,
		EndDate:     *endDate,
		Reminders:   eventConfig.Reminders,
		Summary:     eventConfig.Summary,
	}

	token, err := h.oauthService.GetToken(ctx, userID, "google", h.oauthConfig)
	if err != nil {
		return fmt.Errorf("failed to get oauth token: %w", err)
	}

	tokenSource := h.oauthConfig.TokenSource(ctx, token)

	calendarService, err := calendar.NewService(ctx, option.WithTokenSource(tokenSource))
	if err != nil {
		return fmt.Errorf("failed to create calendar service: %w", err)
	}

	googleEvent, err := google.BuildEvent(googleEventConfig)
	if err != nil {
		return fmt.Errorf("failed to build event: %w", err)
	}

	if eventConfig.CalendarID == nil {
		primaryID := primaryCalendarID
		eventConfig.CalendarID = &primaryID
	}

	createdEvent, err := google.CreateEvent(
		ctx,
		calendarService,
		*eventConfig.CalendarID,
		googleEvent,
	)
	if err != nil {
		return fmt.Errorf("failed to create event: %w", err)
	}

	h.logger.WithFields(logrus.Fields{
		"event": createdEvent,
	}).Info("event created")

	return nil
}

func (h *CreateEventHandler) Validate(config ActionNodeInput) error {
	eventConfig, err := ExtractEventConfig(config)
	if err != nil {
		return fmt.Errorf("failed to extract event config: %w", err)
	}

	startDate, endDate, err := ParseAndValidateEventSchedule(eventConfig.Schedule)
	if err != nil {
		return fmt.Errorf("failed to parse event schedule: %w", err)
	}

	googleEventConfig := &models.EventConfig{
		Description: eventConfig.Description,
		Location:    eventConfig.Location,
		StartDate:   *startDate,
		EndDate:     *endDate,
		Reminders:   eventConfig.Reminders,
		Summary:     eventConfig.Summary,
	}

	_, err = google.BuildEvent(googleEventConfig)
	if err != nil {
		return fmt.Errorf("failed to build event invalid node config: %w", err)
	}

	return nil
}

func ParseAndValidateEventSchedule(
	schedule EventSchedule,
) (*models.EventDateTime, *models.EventDateTime, error) {
	start := carbon.Now(schedule.TimeZone)

	var startEventDateTime models.EventDateTime

	var endEventDateTime models.EventDateTime

	if schedule.Duration.IsAllDay {
		end := *start.AddDays(1)
		startDate := start.ToDateString()
		endDate := end.ToDateString()
		startEventDateTime.Date = &startDate
		endEventDateTime.Date = &endDate

		return &startEventDateTime, &endEventDateTime, nil
	}

	switch schedule.Start.Type {
	case Immediate:
		start = carbon.Now(schedule.TimeZone)
	case Tomorrow:
		start = start.AddDays(1)

		if schedule.Start.Time != nil {
			t := carbon.ParseByFormat(*schedule.Start.Time, "15:04", schedule.TimeZone)
			start = start.SetHour(t.Hour()).SetMinute(t.Minute())
		}
	case Custom:
		if schedule.Start.Days == nil {
			return nil, nil, errors.New("days is required for custom start timing")
		}

		start = start.AddDays(*schedule.Start.Days)

		if schedule.Start.Time != nil {
			t := carbon.ParseByFormat(*schedule.Start.Time, "15:04", schedule.TimeZone)
			start = start.SetHour(t.Hour()).SetMinute(t.Minute())
		}
	}

	if schedule.Duration.Minutes == nil {
		return nil, nil, errors.New("minutes is required for custom duration")
	}

	startDateTimeStr := start.ToRfc3339String()
	endDateTimeStr := start.AddMinutes(*schedule.Duration.Minutes).ToRfc3339String()

	startEventDateTime.DateTime = &startDateTimeStr
	endEventDateTime.DateTime = &endDateTimeStr

	return &startEventDateTime, &endEventDateTime, nil
}
