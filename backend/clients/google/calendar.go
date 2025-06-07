package google

import (
	"context"
	"errors"
	"fmt"

	"github.com/tinyautomator/tinyautomator-core/backend/models"
	"google.golang.org/api/calendar/v3"
)

func BuildEvent(eventCfg *models.EventConfig) (*calendar.Event, error) {
	if eventCfg == nil {
		return nil, errors.New("event config is nil")
	}

	if (eventCfg.StartDate.Date == nil && eventCfg.StartDate.DateTime == nil) ||
		(eventCfg.EndDate.Date == nil && eventCfg.EndDate.DateTime == nil) {
		return nil, errors.New("start and end must have either date or datetime")
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

	if eventCfg.TimeZone != nil {
		event.Start.TimeZone = *eventCfg.TimeZone
		event.End.TimeZone = *eventCfg.TimeZone
	}

	// Optional fields
	if eventCfg.Summary != nil {
		event.Summary = *eventCfg.Summary
	}

	if eventCfg.Description != nil {
		event.Description = *eventCfg.Description
	}

	if eventCfg.Attendees != nil {
		event.Attendees = make([]*calendar.EventAttendee, len(eventCfg.Attendees))
		for i, attendee := range eventCfg.Attendees {
			event.Attendees[i] = &calendar.EventAttendee{Email: attendee}
		}
	}

	if eventCfg.Location != nil {
		event.Location = *eventCfg.Location
	}

	event.Reminders = &calendar.EventReminders{
		UseDefault: eventCfg.Reminders,
	}

	// Hardcoded fields
	// All automator events are pink :3
	event.ColorId = "4"

	return event, nil
}

func GetCalendarList(
	ctx context.Context,
	service *calendar.Service,
) (*calendar.CalendarList, error) {
	calendarList, err := service.CalendarList.List().Context(ctx).Do()
	if err != nil {
		return nil, fmt.Errorf("unable to get calendar list: %w", err)
	}

	return calendarList, nil
}

func CreateEvent(
	ctx context.Context,
	service *calendar.Service,
	calendarID string,
	event *calendar.Event,
) (*calendar.Event, error) {
	event, err := service.Events.Insert(calendarID, event).Context(ctx).Do()
	if err != nil {
		return nil, fmt.Errorf("unable to create event: %w", err)
	}

	return event, nil
}
