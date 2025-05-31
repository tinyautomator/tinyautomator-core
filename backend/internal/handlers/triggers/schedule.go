package triggers

import (
	"context"
	"fmt"

	"github.com/dromara/carbon/v2"
	"github.com/sirupsen/logrus"
)

type ScheduleTriggerHandler struct {
	logger logrus.FieldLogger
}

func NewScheduleTriggerHandler(logger logrus.FieldLogger) TriggerHandler {
	return &ScheduleTriggerHandler{
		logger: logger,
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

	schedule, ok := (*input.Config)["scheduledDate"]
	if !ok {
		return fmt.Errorf("schedule is required")
	}

	dt := carbon.Parse(schedule.(string))
	h.logger.WithFields(logrus.Fields{
		"schedule": dt.ToDateTimeString(),
	}).Info("CARBON schedule date")

	if dt.IsZero() {
		return fmt.Errorf("invalid schedule date")
	}

	if dt.IsPast() {
		return fmt.Errorf("schedule date is in the past")
	}

	h.logger.Info("schedule date is valid")

	return nil
}
