package google

import (
	"context"
	"fmt"

	"github.com/sirupsen/logrus"
	"golang.org/x/oauth2"
	"google.golang.org/api/calendar/v3"
	"google.golang.org/api/option"
)

type CalendarClient struct {
	service    *calendar.Service
	logger     logrus.FieldLogger
	token      *oauth2.Token
	userID     string
	calendarID string
}

func NewCalendarClient(
	ctx context.Context,
	token *oauth2.Token,
	oauthConfig *oauth2.Config,
	logger logrus.FieldLogger,
	userID string,
	calendarID string,
) (*CalendarClient, error) {
	tokenSource := oauthConfig.TokenSource(ctx, token)

	service, err := calendar.NewService(ctx, option.WithTokenSource(tokenSource))
	if err != nil {
		return nil, fmt.Errorf("unable to init calendar service: %w", err)
	}

	if calendarID == "" {
		calendarID = primaryCalendarID
	}

	return &CalendarClient{
		service:    service,
		logger:     logger,
		token:      token,
		userID:     userID,
		calendarID: calendarID,
	}, nil
}

const (
	primaryCalendarID = "primary"
	defaultTimeZone   = "UTC"
)

type EventConfig struct {
	Description *string
	Summary     *string
	Location    *string
	StartDate   *string
	EndDate     *string
	AllDay      *bool
	TimeZone    *string
	Reminders   *bool
	Attendees   []*calendar.EventAttendee
}

type CalendarConfig struct {
	Summary     *string
	Description *string
	Location    *string
	TimeZone    *string
}

func (c *CalendarClient) BuildEvent(eventCfg *EventConfig) *calendar.Event {
	if eventCfg == nil {
		return &calendar.Event{}
	}

	event := &calendar.Event{}
	if eventCfg.Description != nil {
		event.Description = *eventCfg.Description
	}

	if eventCfg.Summary != nil {
		event.Summary = *eventCfg.Summary
	}

	if eventCfg.Location != nil {
		event.Location = *eventCfg.Location
	}

	if eventCfg.AllDay != nil && *eventCfg.AllDay {
		if eventCfg.StartDate != nil && eventCfg.TimeZone != nil {
			event.Start = &calendar.EventDateTime{
				Date:     *eventCfg.StartDate,
				TimeZone: *eventCfg.TimeZone,
			}
		}

		if eventCfg.EndDate != nil && eventCfg.TimeZone != nil {
			event.End = &calendar.EventDateTime{
				Date:     *eventCfg.EndDate,
				TimeZone: *eventCfg.TimeZone,
			}
		}
	} else {
		if eventCfg.StartDate != nil && eventCfg.TimeZone != nil {
			event.Start = &calendar.EventDateTime{
				DateTime: *eventCfg.StartDate,
				TimeZone: *eventCfg.TimeZone,
			}
		}

		if eventCfg.EndDate != nil && eventCfg.TimeZone != nil {
			event.End = &calendar.EventDateTime{
				DateTime: *eventCfg.EndDate,
				TimeZone: *eventCfg.TimeZone,
			}
		}
	}

	if len(eventCfg.Attendees) > 0 {
		event.Attendees = eventCfg.Attendees
	}

	if eventCfg.Reminders != nil && *eventCfg.Reminders {
		event.Reminders = &calendar.EventReminders{UseDefault: true}
	}

	return event
}

func (c *CalendarClient) GetCalendarList(ctx context.Context) (*calendar.CalendarList, error) {
	calendarList, err := c.service.CalendarList.List().Context(ctx).Do()
	if err != nil {
		return nil, fmt.Errorf("unable to get calendar list: %w", err)
	}

	return calendarList, nil
}

func (c *CalendarClient) CreateEvent(
	ctx context.Context,
	event *calendar.Event,
) (*calendar.Event, error) {
	event, err := c.service.Events.Insert(c.calendarID, event).Context(ctx).Do()
	if err != nil {
		return nil, fmt.Errorf("unable to create event: %w", err)
	}

	return event, nil
}
