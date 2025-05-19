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
	ID         int32           `json:"id"`
	ActionType string          `json:"action_type"`
	Config     *map[string]any `json:"config"`
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
	WorkflowID     int32     `json:"workflow_id"`
	ScheduleType   string    `json:"schedule_type"`
	ExecutionState string    `json:"execution_state"`
	NextRunAt      null.Time `json:"next_run_at"`
	LastRunAt      null.Time `json:"last_run_at"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type WorkflowRun struct {
	ID         int32     `json:"id"`
	WorkflowID int32     `json:"workflow_id"`
	Status     string    `json:"status"`
	StartedAt  time.Time `json:"started_at"`
	FinishedAt null.Time `json:"finished_at"`
}

type WorkflowRunNodeRun struct {
	ID             int32       `json:"id"`
	WorkflowRunID  int32       `json:"workflow_run_id"`
	WorkflowNodeID int32       `json:"workflow_node_id"`
	Status         string      `json:"status"`
	StartedAt      time.Time   `json:"started_at"`
	FinishedAt     null.Time   `json:"finished_at"`
	Metadata       null.String `json:"metadata"`
	ErrorMessage   null.String `json:"error_message"`
	CreatedAt      time.Time   `json:"created_at"`
}

type ValidateNode struct {
	ID         string `json:"id"`
	ActionType string `json:"action_type"`
}

type ValidateEdge struct {
	SourceNodeID string `json:"source_node_id"`
	TargetNodeID string `json:"target_node_id"`
}

type WorkflowNodeTask struct {
	WorkflowID int32 `json:"workflow_id"`
	RunID      int32 `json:"run_id"`
	NodeID     int32 `json:"node_id"`
	NodeRunID  int32 `json:"node_run_id"`
}

func BuildWorkflowNodeTaskPayload(workflowID, runID, nodeID, nodeRunID int32) ([]byte, error) {
	task := WorkflowNodeTask{
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
