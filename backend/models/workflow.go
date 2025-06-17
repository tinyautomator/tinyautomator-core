package models

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/guregu/null/v6"
)

type WorkflowCore struct {
	ID          int32  `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Status      string `json:"status"`
	CreatedAt   int64  `json:"created_at"`
	UpdatedAt   int64  `json:"updated_at"`
}

type Workflow struct {
	WorkflowCore
	UserID string `json:"-"`
}

type WorkflowNodeCore struct {
	ID       int32           `json:"id"`
	Category string          `json:"category"`
	NodeType string          `json:"node_type"`
	Config   *map[string]any `json:"config"`
}

type WorkflowNode struct {
	WorkflowNodeCore
	WorkflowID int32 `json:"-"`
}

type WorkflowNodePosition struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}

type WorkflowNodeDTO struct {
	WorkflowNodeCore
	ID       string                `json:"id"`
	Position *WorkflowNodePosition `json:"position"`
}

type WorkflowEdge struct {
	WorkflowID   int32
	SourceNodeID int32
	TargetNodeID int32
}

type WorkflowEdgeDTO struct {
	ID           string `json:"id"`
	SourceNodeID string `json:"source_node_id"`
	TargetNodeID string `json:"target_node_id"`
}

type WorkflowGraph struct {
	ID    int32
	Nodes []*WorkflowNode
	Edges []*WorkflowEdge
}

type WorkflowGraphDTO struct {
	ID          int32              `json:"id"`
	Name        string             `json:"name"`
	Description string             `json:"description"`
	Nodes       []*WorkflowNodeDTO `json:"nodes"`
	Edges       []*WorkflowEdgeDTO `json:"edges"`
}

type WorkflowSchedule struct {
	ID             int32     `json:"id"`
	UserID         string    `json:"user_id"`
	WorkflowID     int32     `json:"workflow_id"`
	ScheduleType   string    `json:"schedule_type"`
	ExecutionState string    `json:"execution_state"`
	NextRunAt      null.Time `json:"next_run_at"`
	LastRunAt      null.Time `json:"last_run_at"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type WorkflowEmailConfig struct {
	EmailAddress string   `json:"email_address"`
	Keywords     []string `json:"keywords"`
	HistoryType  string   `json:"history_type"`
	LabelIds     []string `json:"label_ids"`
}

type WorkflowEmail struct {
	ID             int32               `json:"id"`
	UserID         string              `json:"user_id"`
	WorkflowID     int32               `json:"workflow_id"`
	Config         WorkflowEmailConfig `json:"config"`
	HistoryID      string              `json:"history_id"`
	ExecutionState string              `json:"execution_state"`
	LastSyncedAt   time.Time           `json:"last_synced_at"`
}

type EventStatus string

const (
	EventStatusCreated   EventStatus = "created"
	EventStatusUpdated   EventStatus = "edited"
	EventStatusStarting  EventStatus = "starting"
	EventStatusEnding    EventStatus = "ending"
	EventStatusCancelled EventStatus = "cancelled"
)

var EventStatuses = map[string]EventStatus{
	"cancelled": EventStatusCancelled,
	"starting":  EventStatusStarting,
	"ending":    EventStatusEnding,
}

type WorkflowCalendarConfig struct {
	CalendarID           *string     `json:"calendarID,omitempty"`
	Keywords             []string    `json:"keywords,omitempty"`
	TimeCondition        *int        `json:"timeCondition,omitempty"`
	EventStatusCondition EventStatus `json:"eventStatus"`
}

type WorkflowCalendar struct {
	ID             int32                  `json:"id"`
	UserID         string                 `json:"user_id"`
	WorkflowID     int32                  `json:"workflow_id"`
	Config         WorkflowCalendarConfig `json:"config"`
	SyncToken      string                 `json:"sync_token"`
	ExecutionState string                 `json:"execution_state"`
	LastSyncedAt   time.Time              `json:"last_synced_at"`
}
type WorkflowRunCore struct {
	ID         int32     `json:"id"`
	WorkflowID int32     `json:"workflow_id"`
	Status     string    `json:"status"`
	FinishedAt null.Time `json:"finished_at"`
	CreatedAt  time.Time `json:"created_at"`
}

type UserWorkflowRunDTO struct {
	WorkflowID    int32     `json:"workflow_id"`
	WorkflowName  string    `json:"workflow_name"`
	WorkflowRunID int32     `json:"workflow_run_id"`
	Status        string    `json:"status"`
	CreatedAt     time.Time `json:"created_at"`
	FinishedAt    null.Time `json:"finished_at"`
}

type WorkflowRunWithNodesDTO struct {
	WorkflowRunCore
	Nodes []*WorkflowNodeRunCore `json:"nodes"`
}

type WorkflowNodeRunCore struct {
	ID             int32       `json:"id"`
	WorkflowRunID  int32       `json:"workflow_run_id"`
	WorkflowNodeID int32       `json:"workflow_node_id"`
	Status         string      `json:"status"`
	RetryCount     int32       `json:"retry_count"`
	StartedAt      null.Time   `json:"started_at"`
	FinishedAt     null.Time   `json:"finished_at"`
	Metadata       null.String `json:"metadata"`
	ErrorMessage   null.String `json:"error_message"`
}

type ValidateNode struct {
	ID       string `json:"id"`
	NodeType string `json:"node_type"`
	Category string `json:"category"`
}

type ValidateEdge struct {
	SourceNodeID string `json:"source_node_id"`
	TargetNodeID string `json:"target_node_id"`
}

type WorkflowNodeTask struct {
	UserID     string `json:"user_id"`
	WorkflowID int32  `json:"workflow_id"`
	RunID      int32  `json:"run_id"`
	NodeID     int32  `json:"node_id"`
	NodeRunID  int32  `json:"node_run_id"`
	RetryCount int32  `json:"retry_count,omitempty"`
	Status     string `json:"status,omitempty"`
}

func BuildWorkflowNodeTaskPayload(
	userID string,
	workflowID, runID, nodeID, nodeRunID int32,
) ([]byte, error) {
	task := WorkflowNodeTask{
		UserID:     userID,
		WorkflowID: workflowID,
		RunID:      runID,
		NodeID:     nodeID,
		NodeRunID:  nodeRunID,
	}

	data, err := json.Marshal(task)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal WorkflowNodeTask: %w", err)
	}

	return data, nil
}
