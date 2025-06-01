package triggers

import (
	"context"
	"fmt"

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

func validateScheduleType(scheduleType models.ScheduleType) error {
	scheduleTypes := []models.ScheduleType{
		models.ScheduleTypeOnce,
		models.ScheduleTypeDaily,
		models.ScheduleTypeWeekly,
		models.ScheduleTypeMonthly,
	}

	for _, st := range scheduleTypes {
		if st == scheduleType {
			return nil
		}
	}

	return fmt.Errorf("invalid schedule type: %s", scheduleType)
}

func (h *ScheduleTriggerHandler) Validate(input TriggerNodeInput) error {
	h.logger.WithFields(logrus.Fields{
		"config": input.Config,
	}).Info("validating schedule trigger")

	h.logger.WithFields(logrus.Fields{
		"config": input.Config,
	}).Info("validating schedule type")

	scheduleType, ok := (*input.Config)["scheduleType"]
	if !ok {
		return fmt.Errorf("schedule type is required")
	}

	if err := validateScheduleType(models.ScheduleType(scheduleType.(string))); err != nil {
		h.logger.WithFields(logrus.Fields{
			"config": input.Config,
		}).Error("invalid schedule type")

		return err
	}

	scheduledDate, ok := (*input.Config)["scheduledDate"]
	if !ok {
		return fmt.Errorf("schedule is required")
	}

	h.logger.WithFields(logrus.Fields{
		"scheduledDate": scheduledDate,
	}).Info("scheduled date")

	h.logger.Info("schedule date is valid")

	return nil
}
