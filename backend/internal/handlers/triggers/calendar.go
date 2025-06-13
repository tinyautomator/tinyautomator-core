package triggers

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
)

type CalendarEventTriggerHandler struct {
	logger      logrus.FieldLogger
	calendarSvc models.WorkflowCalendarService
}

func NewCalendarEventTriggerHandler(
	cfg models.AppConfig,
) TriggerHandler {
	return &CalendarEventTriggerHandler{
		logger:      cfg.GetLogger(),
		calendarSvc: cfg.GetWorkflowCalendarService(),
	}
}

func buildCalendarConfig(input TriggerNodeInput) (*models.WorkflowCalendarConfig, error) {
	var c models.WorkflowCalendarConfig

	bytes, err := json.Marshal(*input.Config)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal calendar config: %w", err)
	}

	err = json.Unmarshal(bytes, &c)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal calendar config: %w", err)
	}

	return &c, nil
}

func (h *CalendarEventTriggerHandler) Validate(input TriggerNodeInput) error {
	c, err := buildCalendarConfig(input)
	if err != nil {
		return fmt.Errorf("failed to build calendar config: %w", err)
	}

	if err = h.calendarSvc.ValidateCalendarConfig(*c); err != nil {
		return fmt.Errorf("failed to validate calendar config: %w", err)
	}

	return nil
}

func (h *CalendarEventTriggerHandler) Execute(ctx context.Context, input TriggerNodeInput) error {
	c, err := buildCalendarConfig(input)
	if err != nil {
		return fmt.Errorf("failed to build calendar config: %w", err)
	}

	workflowID, ok := (*input.Config)["workflow_id"].(int32)
	if !ok {
		return fmt.Errorf("workflow id is required")
	}

	userID, ok := (*input.Config)["user_id"].(string)
	if !ok {
		return fmt.Errorf("user id is required")
	}

	if c.CalendarID == nil || *c.CalendarID == "" {
		primaryCalendarID := "primary"
		c.CalendarID = &primaryCalendarID
	}

	_, err = h.calendarSvc.CreateWorkflowCalendar(ctx, workflowID, userID, *c)
	if err != nil {
		return fmt.Errorf("failed to create workflow calendar: %w", err)
	}

	return nil
}

func (h *CalendarEventTriggerHandler) Update(ctx context.Context, input TriggerNodeInput) error {
	c, err := buildCalendarConfig(input)
	if err != nil {
		return fmt.Errorf("failed to build calendar config: %w", err)
	}

	workflowID, ok := (*input.Config)["workflow_id"].(int32)
	if !ok {
		return fmt.Errorf("workflow id is required")
	}

	userID, ok := (*input.Config)["user_id"].(string)
	if !ok {
		return fmt.Errorf("user id is required")
	}

	syncToken, err := h.calendarSvc.GetSyncToken(ctx, *c.CalendarID, userID)
	if err != nil {
		return fmt.Errorf("failed to get sync token: %w", err)
	}

	executionState := "queued"
	lastSyncedAt := time.Now().UTC()

	err = h.calendarSvc.UpdateWorkflowCalendar(
		ctx,
		workflowID,
		*c,
		*syncToken,
		executionState,
		lastSyncedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to update workflow calendar: %w", err)
	}

	return nil
}
