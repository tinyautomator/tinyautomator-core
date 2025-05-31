package triggers

import (
	"context"
	"fmt"
)

type TriggerNodeInput struct {
	Config *map[string]any
}

type TriggerHandler interface {
	Execute(ctx context.Context, input TriggerNodeInput) error
	Validate(input TriggerNodeInput) error
}

type TriggerRegistry struct {
	handlers map[string]TriggerHandler
}

func NewTriggerRegistry() *TriggerRegistry {
	return &TriggerRegistry{
		handlers: make(map[string]TriggerHandler),
	}
}

func (r *TriggerRegistry) Register(nodeType string, handler TriggerHandler) {
	r.handlers[nodeType] = handler
}

func (r *TriggerRegistry) Execute(nodeType string, input TriggerNodeInput) error {
	handler, exists := r.handlers[nodeType]
	if !exists {
		return fmt.Errorf("unknown trigger type: %s", nodeType)
	}

	if err := handler.Validate(input); err != nil {
		return fmt.Errorf("failed to validate trigger: %w", err)
	}

	if err := handler.Execute(context.Background(), input); err != nil {
		return fmt.Errorf("failed to execute trigger: %w", err)
	}

	return nil
}
