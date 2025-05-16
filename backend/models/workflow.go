package models

type WorkflowDTO struct {
	ID          int32  `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Status      string `json:"status"`
	CreatedAt   int64  `json:"created_at"`
	UpdatedAt   int64  `json:"updated_at"`
}

type WorkflowNodePosition struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}

type WorkflowNodeData struct {
	Label      string         `json:"label"`
	ActionType string         `json:"actionType"`
	Config     map[string]any `json:"config"`
}

type WorkflowNodeDTO struct {
	ID       string               `json:"id"`
	Position WorkflowNodePosition `json:"position"`
	Data     WorkflowNodeData     `json:"data"`
}

type WorkflowEdgeDTO struct {
	ID           string `json:"id"`
	SourceNodeID int32  `json:"source_node_id"`
	TargetNodeID int32  `json:"target_node_id"`
}

type WorkflowGraphDTO struct {
	ID          int32             `json:"id"`
	Name        string            `json:"name"`
	Description string            `json:"description"`
	Nodes       []WorkflowNodeDTO `json:"nodes"`
	Edges       []WorkflowEdgeDTO `json:"edges"`
}

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
