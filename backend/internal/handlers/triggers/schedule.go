package triggers

import (
	"context"
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

	return nil
}

func (h *ScheduleTriggerHandler) Validate(input TriggerNodeInput) error {
	h.logger.WithFields(logrus.Fields{
		"config": input.Config,
	}).Info("validating schedule trigger")

	scheduleType, ok := (*input.Config)["scheduleType"]
	if !ok {
		return fmt.Errorf("schedule type is required")
	}

	scheduledDate, ok := (*input.Config)["scheduledDate"]
	if !ok {
		return fmt.Errorf("schedule is required")
	}

	if err := h.schedulerSvc.ValidateSchedule(scheduleType.(string), scheduledDate.(time.Time)); err != nil {
		h.logger.WithFields(logrus.Fields{
			"config": input.Config,
		}).Error("invalid schedule type")

		return fmt.Errorf("invalid schedule type: %w", err)
	}

	return nil
}
