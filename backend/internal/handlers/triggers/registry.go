package triggers

import (
	"context"
	"fmt"
)

type TriggerNodeInput struct {
	Config map[string]interface{}
}

type TriggerHandler interface {
	Execute(ctx context.Context, input TriggerNodeInput) error
	Validate(config map[string]interface{}) error
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
		return fmt.Errorf("unknown Trigger type: %s", nodeType)
	}

	return handler.Execute(context.Background(), input)
}
