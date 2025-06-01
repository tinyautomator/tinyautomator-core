package triggers

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
)

type ScheduleTriggerHandler struct {
	logger       logrus.FieldLogger
	schedulerSvc models.SchedulerService
}

func NewScheduleTriggerHandler(
	logger logrus.FieldLogger,
	schedulerSvc models.SchedulerService,
) TriggerHandler {
	return &ScheduleTriggerHandler{
		logger:       logger,
		schedulerSvc: schedulerSvc,
	}
}

func (h *ScheduleTriggerHandler) Execute(ctx context.Context, input TriggerNodeInput) error {
	h.logger.WithFields(logrus.Fields{
		"config": input.Config,
	}).Info("executing schedule trigger")

	_, ok := (*input.Config)["scheduleType"].(string)
	if !ok {
		return errors.New("schedule type is required")
	}

	rawScheduledDate, ok := (*input.Config)["scheduledDate"].(string)
	if !ok {
		return errors.New("schedule is required")
	}

	_, err := time.Parse(time.RFC3339, rawScheduledDate)
	if err != nil {
		return fmt.Errorf("invalid schedule date: %w", err)
	}

	return nil
}

func (h *ScheduleTriggerHandler) Validate(input TriggerNodeInput) error {
	h.logger.WithFields(logrus.Fields{
		"config": input.Config,
	}).Debug("validating schedule trigger")

	scheduleType, ok := (*input.Config)["scheduleType"].(string)
	if !ok {
		return fmt.Errorf("schedule type is required")
	}

	rawScheduledDate, ok := (*input.Config)["scheduledDate"].(string)
	if !ok {
		return fmt.Errorf("schedule is required")
	}

	scheduledDate, err := time.Parse(time.RFC3339, rawScheduledDate)
	if err != nil {
		return fmt.Errorf("invalid schedule date: %w", err)
	}

	logrus.WithFields(logrus.Fields{
		"scheduledDate": scheduledDate,
	}).Info("scheduled date")

	if err := h.schedulerSvc.ValidateSchedule(scheduleType, scheduledDate); err != nil {
		return fmt.Errorf("invalid schedule type: %w", err)
	}

	return nil
}
