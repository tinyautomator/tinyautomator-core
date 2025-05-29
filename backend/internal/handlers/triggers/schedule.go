package triggers

import (
	"context"
)

type ScheduleTriggerHandler struct{}

func (h *ScheduleTriggerHandler) Execute(ctx context.Context, input TriggerNodeInput) error {
	return nil
}

func (h *ScheduleTriggerHandler) Validate(config map[string]interface{}) error {
	return nil
}
