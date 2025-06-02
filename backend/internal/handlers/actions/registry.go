package handlers

import (
	"context"
	"fmt"

	"github.com/sirupsen/logrus"
)

type ActionNodeInput struct {
	Config map[string]any
}

type ActionHandler interface {
	Execute(ctx context.Context, userID string, input ActionNodeInput) error
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

func (r *ActionRegistry) Execute(userID string, nodeType string, input ActionNodeInput) error {
	handler, exists := r.handlers[nodeType]
	if !exists {
		// return fmt.Errorf("unknown action type: %s", nodeType)
		return nil
	}

	err := handler.Execute(context.Background(), userID, input)
	if err != nil {
		return fmt.Errorf("failed to execute action: %w", err)
	}

	return nil
}
