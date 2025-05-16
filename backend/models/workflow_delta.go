package models

type WorkflowDelta struct {
	Name            string
	Description     string
	UpdateMetadata  bool
	NodesToCreate   []*WorkflowNodeDTO
	NodesToUpdate   []*WorkflowNodeDTO
	NodesToUpdateUI []*WorkflowNodeDTO
	NodeIDsToDelete []int32
	EdgesToAdd      []*WorkflowEdgeDTO
	EdgesToDelete   []*WorkflowEdgeDTO
}
