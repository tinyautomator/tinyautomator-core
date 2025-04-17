package timetrigger

import (
	"errors"
	"time"

	"github.com/tinyautomator/tinyautomator-core/backend/models"
)

type inMemoryRepository struct {
	triggers map[uint]models.TimeTrigger
	nextID   uint
}

func NewInMemoryRepository() Repository {
	return &inMemoryRepository{
		triggers: make(map[uint]models.TimeTrigger),
		nextID:   1,
	}
}

func (r *inMemoryRepository) SaveTrigger(t models.TimeTrigger) (models.TimeTrigger, error) {
	t.ID = r.nextID
	r.triggers[t.ID] = t
	r.nextID++
	return t, nil
}

func (r *inMemoryRepository) UpdateTrigger(t models.TimeTrigger) error {
	if _, exists := r.triggers[t.ID]; !exists {
		return errors.New("trigger not found")
	}
	r.triggers[t.ID] = t
	return nil
}

func (r *inMemoryRepository) GetTriggerByID(id uint) (models.TimeTrigger, error) {
	trigger, exists := r.triggers[id]
	if !exists {
		return models.TimeTrigger{}, errors.New("trigger not found")
	}
	return trigger, nil
}

func (r *inMemoryRepository) FetchTriggersScheduledWithinDuration(
	duration time.Duration,
) ([]models.TimeTrigger, error) {
	now := time.Now().UTC()
	cutoff := now.Add(duration)

	results := make([]models.TimeTrigger, 0, len(r.triggers))

	for _, trigger := range r.triggers {
		if trigger.NextRun.Before(cutoff) {
			results = append(results, trigger)
		}
	}

	return results, nil
}
