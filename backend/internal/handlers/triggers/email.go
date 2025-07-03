package triggers

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
)

type EmailTriggerHandler struct {
	emailSvc models.WorkflowEmailService
	logger   logrus.FieldLogger
}

func NewEmailTriggerHandler(cfg models.AppConfig) TriggerHandler {
	return &EmailTriggerHandler{
		emailSvc: cfg.GetWorkflowEmailService(),
		logger:   cfg.GetLogger(),
	}
}

func buildEmailConfig(input TriggerNodeInput) (*models.WorkflowEmailConfig, error) {
	var c models.WorkflowEmailConfig

	bytes, err := json.Marshal(*input.Config)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal email config: %w", err)
	}

	err = json.Unmarshal(bytes, &c)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal email config: %w", err)
	}

	return &c, nil
}

func (h *EmailTriggerHandler) Validate(input TriggerNodeInput) error {
	c, err := buildEmailConfig(input)
	if err != nil {
		return fmt.Errorf("failed to build email config: %w", err)
	}

	if err = h.emailSvc.ValidateEmailConfig(*c); err != nil {
		return fmt.Errorf("failed to validate email config: %w", err)
	}

	return nil
}

func (h *EmailTriggerHandler) Execute(ctx context.Context, input TriggerNodeInput) error {
	c, err := buildEmailConfig(input)
	if err != nil {
		return fmt.Errorf("failed to build email config: %w", err)
	}

	workflowID, ok := (*input.Config)["workflow_id"].(int32)
	if !ok {
		return fmt.Errorf("workflow id is required")
	}

	userID, ok := (*input.Config)["user_id"].(string)
	if !ok {
		return fmt.Errorf("user id is required")
	}

	historyID, err := h.emailSvc.GetHistoryID(ctx, userID)
	if err != nil {
		return fmt.Errorf("failed to get history id: %w", err)
	}

	historyIDStr := strconv.FormatUint(*historyID, 10)

	_, err = h.emailSvc.CreateWorkflowEmail(ctx, workflowID, *c, historyIDStr)
	if err != nil {
		return fmt.Errorf("failed to create workflow email: %w", err)
	}

	return nil
}

func (h *EmailTriggerHandler) Update(ctx context.Context, input TriggerNodeInput) error {
	c, err := buildEmailConfig(input)
	if err != nil {
		return fmt.Errorf("failed to build email config: %w", err)
	}

	workflowID, ok := (*input.Config)["workflow_id"].(int32)
	if !ok {
		return fmt.Errorf("workflow id is required")
	}

	userID, ok := (*input.Config)["user_id"].(string)
	if !ok {
		return fmt.Errorf("user id is required")
	}

	historyID, err := h.emailSvc.GetHistoryID(ctx, userID)
	if err != nil {
		return fmt.Errorf("failed to get history id: %w", err)
	}

	historyIDStr := strconv.FormatUint(*historyID, 10)

	err = h.emailSvc.UpdateWorkflowEmail(ctx, workflowID, *c, historyIDStr)
	if err != nil {
		return fmt.Errorf("failed to update workflow email: %w", err)
	}

	return nil
}
