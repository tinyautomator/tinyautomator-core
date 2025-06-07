package handlers

import (
	"context"
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
	Type StartTimingType
	Days *int
	Time *string
}

type Duration struct {
	IsAllDay bool
	Minutes  *int
}

type EventSchedule struct {
	Start    StartTiming
	Duration Duration
	TimeZone string
}

type HandlerEventConfig struct {
	CalendarID  *string
	Description *string
	Schedule    EventSchedule
	Location    *string
	Reminders   bool
	Summary     *string
}

type CreateEventHandler struct {
	logger       logrus.FieldLogger
	oauthConfig  *oauth2.Config
	oauthService models.OauthIntegrationService
}

func NewCreateEventHandler(
	logger logrus.FieldLogger,
	oauthConfig *oauth2.Config,
	oauthService models.OauthIntegrationService,
) ActionHandler {
	return &CreateEventHandler{logger: logger, oauthConfig: oauthConfig, oauthService: oauthService}
}

func ExtractEventConfig(input ActionNodeInput) (*HandlerEventConfig, error) {
	calendarID, ok := input.Config["calendarID"].(*string)
	if !ok {
		return nil, errors.New("calendarID must be a string")
	}

	description, ok := input.Config["description"].(*string)
	if !ok {
		return nil, errors.New("description must be a string")
	}

	schedule, ok := input.Config["schedule"].(EventSchedule)
	if !ok {
		return nil, errors.New("schedule must be a EventSchedule")
	}

	location, ok := input.Config["location"].(*string)
	if !ok {
		return nil, errors.New("location must be a string")
	}

	reminders, ok := input.Config["reminders"].(bool)
	if !ok {
		return nil, errors.New("reminders must be a bool")
	}

	summary, ok := input.Config["summary"].(*string)
	if !ok {
		return nil, errors.New("summary must be a string")
	}

	return &HandlerEventConfig{
		CalendarID:  calendarID,
		Description: description,
		Schedule:    schedule,
		Location:    location,
		Reminders:   reminders,
		Summary:     summary,
	}, nil
}

const (
	primaryCalendarID = "primary"
	defaultTimeZone   = "UTC"
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
		TimeZone:    &eventConfig.Schedule.TimeZone,
		StartDate:   *startDate,
		EndDate:     *endDate,
		Reminders:   &eventConfig.Reminders,
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
		Reminders:   &eventConfig.Reminders,
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

	startDateTimeStr := start.ToDateTimeString(schedule.TimeZone)
	endDateTimeStr := start.AddMinutes(*schedule.Duration.Minutes).
		ToDateTimeString(schedule.TimeZone)

	startEventDateTime.DateTime = &startDateTimeStr
	endEventDateTime.DateTime = &endDateTimeStr

	return &startEventDateTime, &endEventDateTime, nil
}
