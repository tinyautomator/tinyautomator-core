package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/clients/redis"
	"github.com/tinyautomator/tinyautomator-core/backend/config"
	"github.com/tinyautomator/tinyautomator-core/backend/services"

	repo "github.com/tinyautomator/tinyautomator-core/backend/repositories"
)

type WorkflowController interface {
	GetWorkflow(ctx *gin.Context)
	CreateWorkflow(ctx *gin.Context)
	GetWorkflowRender(ctx *gin.Context)
	RunWorkFlow(ctx *gin.Context)
}

type workflowController struct {
	logger          logrus.FieldLogger
	repo            repo.WorkflowRepository
	orchestrator    services.OrchestratorService
	redis           redis.RedisClient
	workflowService services.WorkflowService
}

type CreateWorkflowRequest struct {
	Name        string              `json:"name"        binding:"required"`
	Description string              `json:"description" binding:"required"`
	Status      string              `json:"status"      binding:"required"`
	Nodes       []repo.WorkflowNode `json:"nodes"       binding:"required"`
	Edges       []repo.WorkflowEdge `json:"edges"       binding:"required"`
} // TODO: Look up validation libraries for the backend

type UpdateWorkflowRequest struct {
	Name        string              `json:"name"        binding:"required"`
	Description string              `json:"description" binding:"required"`
	Nodes       []repo.WorkflowNode `json:"nodes"       binding:"required"`
	Edges       []repo.WorkflowEdge `json:"edges"       binding:"required"`
}

func NewWorkflowController(cfg config.AppConfig) *workflowController {
	return &workflowController{
		logger:          cfg.GetLogger(),
		repo:            cfg.GetWorkflowRepository(),
		redis:           cfg.GetRedisClient(),
		orchestrator:    *services.NewOrchestratorService(cfg),
		workflowService: *services.NewWorkflowService(cfg),
	}
}

func (c *workflowController) GetWorkflow(ctx *gin.Context) {
	idStr := ctx.Param("id")

	workflowID, err := strconv.Atoi(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})

		return
	}

	w, err := c.repo.GetWorkflow(ctx.Request.Context(), int32(workflowID))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "workflow not found"})
		return
	}

	ctx.JSON(http.StatusOK, w)
}

func (c *workflowController) GetUserWorkflows(ctx *gin.Context) {
	w, err := c.repo.GetUserWorkflows(ctx.Request.Context(), "test_user")
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "workflows not found"})

		return
	}

	ctx.JSON(http.StatusOK, w)
}

func (c *workflowController) CreateWorkflow(ctx *gin.Context) {
	var req CreateWorkflowRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		c.logger.WithError(err).Error("invalid request body")
		ctx.JSON(
			http.StatusUnprocessableEntity,
			gin.H{"error": "invalid request body", "details": err.Error()},
		)

		return
	}

	workflow, err := c.repo.CreateWorkflow(
		ctx.Request.Context(),
		"test_user", // TODO: replace this later
		req.Name,
		req.Description,
		req.Nodes,
		req.Edges,
	)
	if err != nil {
		c.logger.Errorf("Workflow insert error: %v", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create workflow"})

		return
	}

	ctx.JSON(http.StatusCreated, gin.H{"id": workflow.ID})
}

func (c *workflowController) UpdateWorkflow(ctx *gin.Context) {
	idStr := ctx.Param("id")

	workflowID, err := strconv.Atoi(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})

		return
	}

	var req UpdateWorkflowRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		c.logger.WithError(err).Error("invalid request body")
		ctx.JSON(
			http.StatusUnprocessableEntity,
			gin.H{"error": "invalid request body", "details": err.Error()},
		)

		return
	}

	existing, err := c.repo.RenderWorkflowGraph(ctx, int32(workflowID))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "workflow not found"})
		return
	}

	delta := repo.WorkflowDelta{
		Name:        req.Name,
		Description: req.Description,
	}

	if existing.Name != req.Name || existing.Description != req.Description {
		delta.UpdateMetadata = true
	}

	existingNodeMap := make(map[string]repo.WorkflowNode)
	for _, n := range existing.Nodes {
		existingNodeMap[n.TempID] = n
	}

	inputNodeIDs := make(map[string]struct{})

	for _, node := range req.Nodes {
		if _, err := uuid.Parse(node.TempID); err == nil {
			delta.NodesToCreate = append(delta.NodesToCreate, node)
			continue
		}

		inputNodeIDs[node.TempID] = struct{}{}

		old, ok := existingNodeMap[node.TempID]
		if !ok {
			ctx.JSON(
				http.StatusBadRequest,
				gin.H{"error": "node ID is not present in the existing workflow"},
			)

			return
		}

		if old.Data.ActionType != node.Data.ActionType || old.Data.Config != node.Data.Config {
			c.logger.WithFields(logrus.Fields{
				"oldActionType": old.Data.ActionType,
				"newActionType": node.Data.ActionType,
				"oldConfig":     old.Data.Config,
				"newConfig":     node.Data.Config,
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
		if _, stillPresent := inputNodeIDs[old.TempID]; !stillPresent {
			existingID, err := strconv.Atoi(old.TempID)
			if err != nil {
				ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid node ID format"})
				return
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
		existingEdgeSet[edgeKey{e.Source, e.Target}] = struct{}{}
	}

	inputEdgeSet := make(map[edgeKey]struct{})

	for _, e := range req.Edges {
		k := edgeKey{e.Source, e.Target}
		inputEdgeSet[k] = struct{}{}

		if _, found := existingEdgeSet[k]; !found {
			delta.EdgesToAdd = append(delta.EdgesToAdd, repo.WorkflowEdge{
				Source: e.Source,
				Target: e.Target,
			})
		}
	}

	for k := range existingEdgeSet {
		if _, found := inputEdgeSet[k]; !found {
			delta.EdgesToDelete = append(delta.EdgesToDelete, repo.WorkflowEdge{
				Source: k.src,
				Target: k.dst,
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
		ctx.JSON(http.StatusOK, gin.H{"message": "no changes to workflow"})
		return
	}

	if err := c.repo.UpdateWorkflow(ctx, int32(workflowID), delta, existing.Nodes); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "failed to update workflow"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "workflow updated"})
}

func (c *workflowController) GetWorkflowRender(ctx *gin.Context) {
	idStr := ctx.Param("id")

	workflowID, err := strconv.Atoi(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})

		return
	}

	wg, err := c.repo.RenderWorkflowGraph(ctx, int32(workflowID))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "workflow not found"})
		return
	}

	ctx.JSON(http.StatusOK, wg)
}
