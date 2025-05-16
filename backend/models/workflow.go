package models

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
