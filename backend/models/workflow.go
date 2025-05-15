package models

type Workflow struct {
	ID          int32
	UserID      string
	Name        string
	Description string
	Status      string
	CreatedAt   int64
	UpdatedAt   int64
}

type WorkflowNode struct {
	ID         int32
	WorkflowID int32
	ActionType string
	Config     map[string]any
}

type WorkflowEdge struct {
	WorkflowID   int32
	SourceNodeID int32
	TargetNodeID int32
}
