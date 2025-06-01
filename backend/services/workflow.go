package services

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"reflect"
	"strconv"

	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/internal"
	"github.com/tinyautomator/tinyautomator-core/backend/internal/handlers/triggers"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
	"github.com/yourbasic/graph"
)

var ErrUserDoesNotHaveAccessToWorkflow = errors.New("user does not have access to workflow")

type WorkflowService struct {
	logger               logrus.FieldLogger
	workflowRepo         models.WorkflowRepository
	workflowScheduleRepo models.WorkflowScheduleRepository
	orchestrator         models.OrchestratorService
	triggerRegistry      *triggers.TriggerRegistry
	schedulerSvc         models.SchedulerService
}

func NewWorkflowService(cfg models.AppConfig) models.WorkflowService {
	logger := cfg.GetLogger()
	schedulerSvc := cfg.GetSchedulerService()
	t := triggers.NewTriggerRegistry()
	t.Register("schedule", triggers.NewScheduleTriggerHandler(logger, schedulerSvc))

	return &WorkflowService{
		logger:               logger,
		workflowRepo:         cfg.GetWorkflowRepository(),
		workflowScheduleRepo: cfg.GetWorkflowScheduleRepository(),
		orchestrator:         cfg.GetOrchestratorService(),
		triggerRegistry:      t,
		schedulerSvc:         schedulerSvc,
	}
}

func (s *WorkflowService) VerifyWorkflowAccess(
	ctx context.Context,
	workflowID int32,
	userID string,
) error {
	workflow, err := s.workflowRepo.GetWorkflow(ctx, workflowID)
	if err != nil {
		return fmt.Errorf("failed to get workflow: %w", err)
	}

	if workflow.UserID != userID {
		return ErrUserDoesNotHaveAccessToWorkflow
	}

	return nil
}

func (s *WorkflowService) prepForValidate(
	nodes []*models.WorkflowNodeDTO,
	edges []*models.WorkflowEdgeDTO,
) ([]models.ValidateNode, []models.ValidateEdge) {
	n := make([]models.ValidateNode, len(nodes))
	e := make([]models.ValidateEdge, len(edges))

	for i, node := range nodes {
		n[i] = models.ValidateNode{
			ID:       node.ID,
			NodeType: node.NodeType,
			Category: node.Category,
		}
	}

	for i, edge := range edges {
		e[i] = models.ValidateEdge{
			SourceNodeID: edge.SourceNodeID,
			TargetNodeID: edge.TargetNodeID,
		}
	}

	return n, e
}

func (s *WorkflowService) ValidateWorkflowGraph(
	nodes []models.ValidateNode,
	edges []models.ValidateEdge,
) error {
	idToIdx := make(map[string]int)
	idxToNode := make(map[int]models.ValidateNode)

	for idx, node := range nodes {
		if node.ID == "" {
			return fmt.Errorf("validation error: node ID is empty")
		}

		idToIdx[node.ID] = idx
		idxToNode[idx] = node
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
		if _, ok := level[idxToNode[nodeIdx].ID]; !ok {
			level[idxToNode[nodeIdx].ID] = 0
			// TODO: for mvp restrict children from only being accessible from their root
			s.logger.WithFields(logrus.Fields{
				"node_id":       idxToNode[nodeIdx].ID,
				"node_type":     idxToNode[nodeIdx].NodeType,
				"node_category": idxToNode[nodeIdx].Category,
			}).Info("root node found")
		}

		var err error
		if notValid := g.Visit(nodeIdx, func(childIdx int, _ int64) bool {
			parent := idxToNode[nodeIdx].ID
			child := idxToNode[childIdx].ID
			parentLevel, pOk := level[parent]
			childLevel, cOk := level[child]

			if pOk && cOk && parentLevel > 0 && childLevel > 0 && parentLevel >= childLevel {
				s.logger.WithFields(logrus.Fields{
					"parent_id":       parent,
					"child_id":        child,
					"parent_type":     idxToNode[nodeIdx].NodeType,
					"parent_category": idxToNode[nodeIdx].Category,
					"child_type":      idxToNode[childIdx].NodeType,
					"child_category":  idxToNode[childIdx].Category,
				}).Warn("invalid level")
				err = fmt.Errorf("validation error: node id %s → %s invalid relationship", parent, child)
				return true
			}
			level[child] = level[parent] + 1
			return false
		}); notValid {
			return err
		}
	}

	return nil
}

func (s *WorkflowService) validateNode(node *models.WorkflowNodeDTO) error {
	if node.Category == "" {
		return fmt.Errorf("validation error: node category is empty")
	}

	if node.NodeType == "" {
		return fmt.Errorf("validation error: node type is empty")
	}

	if node.Config == nil {
		return fmt.Errorf("validation error: node config is nil")
	}

	_, err := json.Marshal(node.Config)
	if err != nil {
		return fmt.Errorf("validation error: node config is not valid JSON: %w", err)
	}

	if node.Category == "trigger" {
		logrus.Debugln("validating trigger", node.NodeType)

		if err := s.triggerRegistry.Validate(node.NodeType, triggers.TriggerNodeInput{
			Config: node.Config,
		}); err != nil {
			return fmt.Errorf("trigger validation error: %w", err)
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
) (*models.WorkflowGraph, error) {
	n, e := s.prepForValidate(nodes, edges)
	if err := s.ValidateWorkflowGraph(n, e); err != nil {
		return nil, fmt.Errorf("failed to validate workflow graph: %w", err)
	}

	for _, node := range nodes {
		if err := s.validateNode(node); err != nil {
			return nil, fmt.Errorf("failed to validate node: %w", err)
		}
	}

	w, err := s.workflowRepo.CreateWorkflow(ctx, userID, name, description, status, nodes, edges)
	if err != nil {
		return nil, fmt.Errorf("failed to create workflow: %w", err)
	}

	rootNodes := internal.GetRootNodes(w)
	for _, node := range rootNodes {
		if node.Category == "trigger" {
			if err := s.triggerRegistry.Execute(node.NodeType, triggers.TriggerNodeInput{
				Config: node.Config,
			}); err != nil {
				return nil, fmt.Errorf("failed to execute trigger: %w", err)
			}
		}
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
	n, e := s.prepForValidate(nodes, edges)
	if err := s.ValidateWorkflowGraph(n, e); err != nil {
		return fmt.Errorf("failed to validate workflow graph: %w", err)
	}

	for _, node := range nodes {
		if err := s.validateNode(node); err != nil {
			return fmt.Errorf("failed to validate node: %w", err)
		}
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

		if old.Category != node.Category || old.NodeType != node.NodeType {
			return fmt.Errorf(
				"node category or type cannot be changed: %s - %s",
				old.Category,
				old.NodeType,
			)
		}

		if !reflect.DeepEqual(old.Config, node.Config) {
			s.logger.WithFields(logrus.Fields{
				"oldConfig": old.Config,
				"newConfig": node.Config,
			}).Info("node config changed")

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

const (
	WorkflowStatusArchived = "archived"
	TriggerTypeScheduled   = "schedule"
	TriggerTypeManual      = "manual"
	// TODO: Add more triggers
)

func (s *WorkflowService) ArchiveWorkflow(ctx context.Context, workflowID int32) error {
	workflow, err := s.workflowRepo.GetWorkflow(ctx, workflowID)
	if err != nil {
		return fmt.Errorf("failed to fetch workflow %d: %w", workflowID, err)
	}

	if workflow.Status == WorkflowStatusArchived {
		return nil
	}

	err = s.workflowRepo.ArchiveWorkflow(ctx, workflow.ID)
	if err != nil {
		return fmt.Errorf("failed to archive workflow: %w", err)
	}

	graph, err := s.workflowRepo.GetWorkflowGraph(ctx, workflowID)
	if err != nil {
		return fmt.Errorf("failed to fetch workflow graph: %w", err)
	}

	rootNodes := internal.GetRootNodes(graph)
	for _, node := range rootNodes {
		s.logger.WithFields(logrus.Fields{"id": node.ID, "category": node.Category}).
			Info("found root node")

		switch node.Category {
		case TriggerTypeScheduled:
			_ = s.workflowScheduleRepo.DeleteWorkflowScheduleByWorkflowID(ctx, workflow.ID)
			// TODO: Add more trigger types
		default:
			s.logger.WithFields(logrus.Fields{"id": node.ID, "category": node.Category}).
				Info("no trigger type found, treating as manual")
		}
	}

	return nil
}
