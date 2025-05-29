package handlers

import (
	"context"
	"fmt"

	"github.com/sirupsen/logrus"
)

type ActionNodeInput struct {
	Config map[string]interface{}
}

type ActionHandler interface {
	Execute(ctx context.Context, input ActionNodeInput) error
	Validate(config ActionNodeInput) error
}

type ActionRegistry struct {
	handlers map[string]ActionHandler
}

func NewActionRegistry(logger logrus.FieldLogger) *ActionRegistry {
	return &ActionRegistry{
		handlers: make(map[string]ActionHandler),
	}
}

func (r *ActionRegistry) Register(nodeType string, handler ActionHandler) {
	r.handlers[nodeType] = handler
}

func (r *ActionRegistry) Execute(nodeType string, input ActionNodeInput) error {
	handler, exists := r.handlers[nodeType]
	if !exists {
		return fmt.Errorf("unknown action type: %s", nodeType)
	}

	return handler.Execute(context.Background(), input)
}
