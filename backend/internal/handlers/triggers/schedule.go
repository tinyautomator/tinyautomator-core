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

type ScheduleTriggerConfig struct {
	WorkflowID    *int32
	ScheduleType  models.ScheduleType
	ScheduledDate time.Time
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

func (h *ScheduleTriggerHandler) buildScheduleConfig(
	input TriggerNodeInput,
) (*ScheduleTriggerConfig, error) {
	scheduleTypeStr, ok := (*input.Config)["scheduleType"].(string)
	if !ok {
		return nil, fmt.Errorf("schedule type is required")
	}

	scheduleType, ok := models.ScheduleTypes[scheduleTypeStr]
	if !ok {
		return nil, fmt.Errorf("invalid schedule type: %s", scheduleTypeStr)
	}

	rawScheduledDate, ok := (*input.Config)["scheduledDate"].(string)
	if !ok {
		return nil, fmt.Errorf("scheduled date is required")
	}

	scheduledDate, err := time.Parse(time.RFC3339, rawScheduledDate)
	if err != nil {
		return nil, fmt.Errorf("invalid scheduled date: %w", err)
	}

	return &ScheduleTriggerConfig{
		ScheduleType:  scheduleType,
		ScheduledDate: scheduledDate.UTC(),
	}, nil
}

func (h *ScheduleTriggerHandler) Execute(ctx context.Context, input TriggerNodeInput) error {
	h.logger.WithFields(logrus.Fields{
		"config": input.Config,
	}).Info("executing schedule trigger")

	scheduleConfig, err := h.buildScheduleConfig(input)
	if err != nil {
		return fmt.Errorf("failed to build schedule config: %w", err)
	}

	workflowID, ok := (*input.Config)["workflow_id"].(int32)
	if !ok {
		return fmt.Errorf("workflow id is required")
	}

	scheduleConfig.WorkflowID = &workflowID

	if err := h.schedulerSvc.ScheduleWorkflow(ctx, *scheduleConfig.WorkflowID, scheduleConfig.ScheduleType, scheduleConfig.ScheduledDate); err != nil {
		return fmt.Errorf("failed to schedule workflow: %w", err)
	}

	return nil
}

func (h *ScheduleTriggerHandler) Validate(input TriggerNodeInput) error {
	h.logger.WithFields(logrus.Fields{
		"config": input.Config,
	}).Debug("validating schedule trigger")

	scheduleConfig, err := h.buildScheduleConfig(input)
	if err != nil {
		return fmt.Errorf("failed to build schedule config: %w", err)
	}

	if err := h.schedulerSvc.ValidateSchedule(scheduleConfig.ScheduleType, scheduleConfig.ScheduledDate, false); err != nil {
		return fmt.Errorf("invalid schedule type: %w", err)
	}

	return nil
}
