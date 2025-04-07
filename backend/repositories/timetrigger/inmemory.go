package timetrigger

import (
	"errors"

	"github.com/tinyautomator/tinyautomator-core/backend/models"
)

type inMemoryRepository struct {
	nextID  int
	triggers []models.TimeTrigger
}

func NewInMemoryRepository() *inMemoryRepository {
	return &inMemoryRepository{
		triggers: []models.TimeTrigger{},
		nextID:  1,
	}
}

func (r *inMemoryRepository) SaveTrigger(t models.TimeTrigger) error {
	t.ID = uint(r.nextID)
	r.nextID++
	r.triggers = append(r.triggers, t)
	return nil
}	

func (r *inMemoryRepository) UpdateTrigger(t models.TimeTrigger) error {
	for i := range r.triggers {
		if r.triggers[i].ID == t.ID {
			r.triggers[i] = t
			return nil
		}
	}
	return errors.New("trigger not found")
}

func (r *inMemoryRepository) FetchDueTriggers() ([]models.TimeTrigger, error) {

	// In a real-world scenario, this would involve checking the current time
	// against the trigger's schedule. For simplicity, we'll return all triggers.
	return r.triggers, nil
}