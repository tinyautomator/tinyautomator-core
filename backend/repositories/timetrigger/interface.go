package timetrigger

import (
	"time"

	"github.com/tinyautomator/tinyautomator-core/backend/models"
)

type Repository interface {
	GetTriggerByID(id uint) (models.TimeTrigger, error)
	SaveTrigger(trigger models.TimeTrigger) (models.TimeTrigger, error)
	UpdateTrigger(trigger models.TimeTrigger) error
	FetchTriggersScheduledWithinDuration(duration time.Duration) ([]models.TimeTrigger, error)
}
