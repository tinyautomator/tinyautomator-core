package google

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/tinyautomator/tinyautomator-core/backend/models"
	"golang.org/x/oauth2"
	"google.golang.org/api/calendar/v3"
	"google.golang.org/api/option"
)

type CalendarClient struct {
	service *calendar.Service
}

func InitCalendarClient(
	ctx context.Context,
	token *oauth2.Token,
	oauthConfig *oauth2.Config,
	userID string,
) (*CalendarClient, error) {
	tokenSource := oauthConfig.TokenSource(ctx, token)

	service, err := calendar.NewService(ctx, option.WithTokenSource(tokenSource))
	if err != nil {
		return nil, fmt.Errorf("unable to init calendar service: %w", err)
	}

	return &CalendarClient{
		service: service,
	}, nil
}

func (c *CalendarClient) BuildEvent(eventCfg *models.EventConfig) (*calendar.Event, error) {
	if eventCfg == nil || eventCfg.StartDate == nil || eventCfg.EndDate == nil {
		return nil, errors.New("event config with start and end dates required")
	}

	if (eventCfg.StartDate.Date == nil && eventCfg.StartDate.DateTime == nil) ||
		(eventCfg.EndDate.Date == nil && eventCfg.EndDate.DateTime == nil) {
		return nil, errors.New("start and end must have either date or datetime")
	}

	if eventCfg.StartDate.DateTime != nil && eventCfg.EndDate.DateTime != nil {
		start, err := time.Parse(time.RFC3339, *eventCfg.StartDate.DateTime)
		if err != nil {
			return nil, fmt.Errorf("invalid start datetime: %w", err)
		}

		end, err := time.Parse(time.RFC3339, *eventCfg.EndDate.DateTime)
		if err != nil {
			return nil, fmt.Errorf("invalid end datetime: %w", err)
		}

		if !end.After(start) {
			return nil, errors.New("end time must be after start time")
		}
	}

	if eventCfg.StartDate.Date != nil && eventCfg.EndDate.Date != nil {
		start, err := time.Parse("2006-01-02", *eventCfg.StartDate.Date)
		if err != nil {
			return nil, fmt.Errorf("invalid start date: %w", err)
		}

		end, err := time.Parse("2006-01-02", *eventCfg.EndDate.Date)
		if err != nil {
			return nil, fmt.Errorf("invalid end date: %w", err)
		}

		if !end.After(start) {
			return nil, errors.New("end date must be after start date")
		}
	}

	event := &calendar.Event{}

	if eventCfg.StartDate.Date != nil {
		event.Start = &calendar.EventDateTime{
			Date: *eventCfg.StartDate.Date,
		}
	} else {
		event.Start = &calendar.EventDateTime{
			DateTime: *eventCfg.StartDate.DateTime,
		}
	}

	if eventCfg.EndDate.Date != nil {
		event.End = &calendar.EventDateTime{
			Date: *eventCfg.EndDate.Date,
		}
	} else {
		event.End = &calendar.EventDateTime{
			DateTime: *eventCfg.EndDate.DateTime,
		}
	}

	// Optional fields
	if eventCfg.Summary != nil {
		event.Summary = *eventCfg.Summary
	}

	if eventCfg.Description != nil {
		event.Description = *eventCfg.Description
	}

	if eventCfg.Location != nil {
		event.Location = *eventCfg.Location
	}

	if eventCfg.Reminders != nil {
		event.Reminders = &calendar.EventReminders{UseDefault: *eventCfg.Reminders}
	}

	// TODO: add attendees

	// Hardcoded fields

	// All automator events are pink :3
	event.ColorId = "4"

	return event, nil
}

func (c *CalendarClient) GetCalendarList(ctx context.Context) (*calendar.CalendarList, error) {
	calendarList, err := c.service.CalendarList.List().Context(ctx).Do()
	if err != nil {
		return nil, fmt.Errorf("unable to get calendar list: %w", err)
	}

	return calendarList, nil
}

func (c *CalendarClient) GetSyncToken(ctx context.Context, calendarID string) (string, error) {
	events, err := c.service.Events.List(calendarID).
		SingleEvents(true).
		Context(ctx).
		Do()
	if err != nil {
		return "", fmt.Errorf("unable to get events: %w", err)
	}

	return events.NextSyncToken, nil
}

func (c *CalendarClient) GetEventsBySyncToken(
	ctx context.Context,
	calendarID string,
	syncToken string,
) (*calendar.Events, error) {
	events, err := c.service.Events.List(calendarID).
		SyncToken(syncToken).
		MaxResults(50).
		Context(ctx).
		Do()
	if err != nil {
		return nil, fmt.Errorf("unable to get events by sync token: %w", err)
	}

	return events, nil
}

func (c *CalendarClient) GetEventsByTimeRange(
	ctx context.Context,
	calendarID string,
	timeMin time.Time,
	timeMax time.Time,
) (*calendar.Events, error) {
	events, err := c.service.Events.List(calendarID).
		TimeMin(timeMin.Format(time.RFC3339)).
		TimeMax(timeMax.Format(time.RFC3339)).
		TimeZone("UTC").
		MaxResults(50).
		Context(ctx).
		Do()
	if err != nil {
		return nil, fmt.Errorf("unable to get events by time range: %w", err)
	}

	return events, nil
}
