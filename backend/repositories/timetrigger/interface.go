package timetrigger

import (
	"github.com/tinyautomator/tinyautomator-core/backend/models"
)

type Repository interface {
	GetTriggerByID(id uint) (models.TimeTrigger, error)
	SaveTrigger        (trigger models.TimeTrigger) (models.TimeTrigger, error)
	UpdateTrigger      (trigger models.TimeTrigger) error
	FetchDueTriggers() ([]models.TimeTrigger, error)
}
