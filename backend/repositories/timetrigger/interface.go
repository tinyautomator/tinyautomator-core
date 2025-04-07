package timetrigger

import (
	"github.com/tinyautomator/tinyautomator-core/backend/models"
)

type Repository interface {
	SaveTrigger        (trigger models.TimeTrigger) error
	UpdateTrigger      (trigger models.TimeTrigger) error
	FetchDueTriggers() ([]models.TimeTrigger, error)
}
