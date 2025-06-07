package models

type EventDateTime struct {
	Date     *string
	DateTime *string
}

type EventConfig struct {
	Description *string
	Summary     *string
	Location    *string
	TimeZone    *string
	Attendees   []string
	StartDate   EventDateTime
	EndDate     EventDateTime
	Reminders   bool
}
