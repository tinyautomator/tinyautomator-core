package services

import (
	"context"
	"fmt"
	"strconv"

	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/config"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
	"github.com/tinyautomator/tinyautomator-core/backend/repositories"
	"github.com/yourbasic/graph"
)

type WorkflowService struct {
	logger       logrus.FieldLogger
	workflowRepo repositories.WorkflowRepository
	orchestrator *OrchestratorService
}

func NewWorkflowService(cfg config.AppConfig) *WorkflowService {
	return &WorkflowService{
		logger:       cfg.GetLogger(),
		workflowRepo: cfg.GetWorkflowRepository(),
		orchestrator: NewOrchestratorService(cfg),
	}
}

func (s *WorkflowService) ValidateWorkflowGraphDTO(
	nodes []*models.WorkflowNodeDTO,
	edges []*models.WorkflowEdgeDTO,
) error {
	idToIdx := make(map[string]int)
	idxToID := make(map[int]*models.WorkflowNodeDTO)

	for idx, node := range nodes {
		if node.ID == "" {
			return fmt.Errorf("validation error: node ID is empty")
		}

		idToIdx[node.ID] = idx
		idxToID[idx] = node
	}

	g := graph.New(len(nodes))

	for _, edge := range edges {
		fromIdx, fromOk := idToIdx[edge.SourceNodeID]
		toIdx, toOk := idToIdx[edge.TargetNodeID]

		if !fromOk || !toOk {
			return fmt.Errorf(
				"validation error: invalid edge: %s -> %s",
				edge.SourceNodeID,
				edge.TargetNodeID,
			)
		}

		g.Add(fromIdx, toIdx)
	}

	order, ok := graph.TopSort(g)
	if !ok {
		return fmt.Errorf("validation error: cycle detected")
	}

	level := make(map[string]int)
	for _, nodeIdx := range order {
		if _, ok := level[idxToID[nodeIdx].ActionType]; !ok {
			level[idxToID[nodeIdx].ActionType] = 0
			// TODO: for mvp restrict children from only being accessible from their root
			s.logger.Infof("root node found %v", idxToID[nodeIdx].ActionType)
		}

		var err error
		if notValid := g.Visit(nodeIdx, func(childIdx int, _ int64) bool {
			parent := idxToID[nodeIdx]
			child := idxToID[childIdx]
			parentLevel, pOk := level[parent.ActionType]
			childLevel, cOk := level[child.ActionType]

			if pOk && cOk && parentLevel > 0 && childLevel > 0 && parentLevel >= childLevel {
				s.logger.Warnf("node %s → %s invalid level", parent.ActionType, child.ActionType)
				err = fmt.Errorf("validation error: node %s → %s invalid relationship", parent.ActionType, child.ActionType)
				return true
			}
			level[child.ActionType] = level[parent.ActionType] + 1
			return false
		}); notValid {
			return err
		}
	}

	return nil
}

func (s *WorkflowService) CreateWorkflow(
	ctx context.Context,
	userID string,
	name string,
	description string,
	status string,
	nodes []*models.WorkflowNodeDTO,
	edges []*models.WorkflowEdgeDTO,
) (*models.Workflow, error) {
	if err := s.ValidateWorkflowGraphDTO(nodes, edges); err != nil {
		return nil, fmt.Errorf("failed to validate workflow graph: %w", err)
	}

	w, err := s.workflowRepo.CreateWorkflow(ctx, userID, name, description, status, nodes, edges)
	if err != nil {
		return nil, fmt.Errorf("failed to create workflow: %w", err)
	}

	return w, nil
}

func (s *WorkflowService) UpdateWorkflow(
	ctx context.Context,
	workflowID int32,
	name string,
	description string,
	nodes []*models.WorkflowNodeDTO,
	edges []*models.WorkflowEdgeDTO,
) error {
	if err := s.ValidateWorkflowGraphDTO(nodes, edges); err != nil {
		return fmt.Errorf("failed to validate workflow graph: %w", err)
	}

	existing, err := s.workflowRepo.RenderWorkflowGraph(ctx, workflowID)
	if err != nil {
		return fmt.Errorf("failed to get workflow: %w", err)
	}

	delta := &models.WorkflowDelta{
		Name:        name,
		Description: description,
	}

	if existing.Name != name || existing.Description != description {
		delta.UpdateMetadata = true
	}

	existingNodeMap := make(map[string]*models.WorkflowNodeDTO)
	for _, n := range existing.Nodes {
		existingNodeMap[n.ID] = n
	}

	inputNodeIDs := make(map[string]struct{})

	for _, node := range nodes {
		if _, err := uuid.Parse(node.ID); err == nil {
			delta.NodesToCreate = append(delta.NodesToCreate, node)
			continue
		}

		inputNodeIDs[node.ID] = struct{}{}

		old, ok := existingNodeMap[node.ID]
		if !ok {
			return fmt.Errorf("node ID is not present in the existing workflow")
		}

		if old.ActionType != node.ActionType || old.Config != node.Config {
			s.logger.WithFields(logrus.Fields{
				"oldActionType": old.ActionType,
				"newActionType": node.ActionType,
				"oldConfig":     old.Config,
				"newConfig":     node.Config,
			}).Info("node action type or config changed")

			delta.NodesToUpdate = append(delta.NodesToUpdate, node)
		}

		uiChanged := old.Position.X != node.Position.X ||
			old.Position.Y != node.Position.Y

		if uiChanged {
			delta.NodesToUpdateUI = append(delta.NodesToUpdateUI, node)
		}
	}

	for _, old := range existing.Nodes {
		if _, stillPresent := inputNodeIDs[old.ID]; !stillPresent {
			existingID, err := strconv.Atoi(old.ID)
			if err != nil {
				return fmt.Errorf("invalid node ID format")
			}

			delta.NodeIDsToDelete = append(delta.NodeIDsToDelete, int32(existingID))
		}
	}

	type edgeKey struct {
		src string
		dst string
	}

	existingEdgeSet := make(map[edgeKey]struct{})
	for _, e := range existing.Edges {
		existingEdgeSet[edgeKey{e.SourceNodeID, e.TargetNodeID}] = struct{}{}
	}

	inputEdgeSet := make(map[edgeKey]struct{})

	for _, e := range edges {
		k := edgeKey{e.SourceNodeID, e.TargetNodeID}
		inputEdgeSet[k] = struct{}{}

		if _, found := existingEdgeSet[k]; !found {
			delta.EdgesToAdd = append(delta.EdgesToAdd, &models.WorkflowEdgeDTO{
				SourceNodeID: e.SourceNodeID,
				TargetNodeID: e.TargetNodeID,
			})
		}
	}

	for k := range existingEdgeSet {
		if _, found := inputEdgeSet[k]; !found {
			delta.EdgesToDelete = append(delta.EdgesToDelete, &models.WorkflowEdgeDTO{
				SourceNodeID: k.src,
				TargetNodeID: k.dst,
			})
		}
	}

	if !delta.UpdateMetadata &&
		len(delta.NodesToCreate) == 0 &&
		len(delta.NodesToUpdate) == 0 &&
		len(delta.NodesToUpdateUI) == 0 &&
		len(delta.NodeIDsToDelete) == 0 &&
		len(delta.EdgesToAdd) == 0 &&
		len(delta.EdgesToDelete) == 0 {
		s.logger.Info("no changes to workflow")
		return nil
	}

	if err := s.workflowRepo.UpdateWorkflow(ctx, workflowID, delta, existing.Nodes); err != nil {
		return fmt.Errorf("failed to update workflow: %w", err)
	}

	return nil
}
