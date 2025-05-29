package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/clients/redis"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
	"github.com/tinyautomator/tinyautomator-core/backend/services"
)

type WorkflowController interface {
	GetWorkflow(ctx *gin.Context)
	CreateWorkflow(ctx *gin.Context)
	GetWorkflowRender(ctx *gin.Context)
	RunWorkFlow(ctx *gin.Context)
	ArchiveWorkflow(ctx *gin.Context)
}

type workflowController struct {
	logger          logrus.FieldLogger
	repo            models.WorkflowRepository
	orchestrator    models.OrchestratorService
	redis           redis.RedisClient
	workflowService models.WorkflowService
}

type CreateWorkflowRequest struct {
	Name        string                    `json:"name"        binding:"required"`
	Description string                    `json:"description" binding:"required"`
	Status      string                    `json:"status"      binding:"required"`
	Nodes       []*models.WorkflowNodeDTO `json:"nodes"       binding:"required"`
	Edges       []*models.WorkflowEdgeDTO `json:"edges"       binding:"required"`
} // TODO: Look up validation libraries for the backend

type UpdateWorkflowRequest struct {
	Name        string                    `json:"name"        binding:"required"`
	Description string                    `json:"description" binding:"required"`
	Nodes       []*models.WorkflowNodeDTO `json:"nodes"       binding:"required"`
	Edges       []*models.WorkflowEdgeDTO `json:"edges"       binding:"required"`
}

func NewWorkflowController(cfg models.AppConfig) *workflowController {
	return &workflowController{
		logger:          cfg.GetLogger(),
		repo:            cfg.GetWorkflowRepository(),
		redis:           cfg.GetRedisClient(),
		orchestrator:    services.NewOrchestratorService(cfg),
		workflowService: services.NewWorkflowService(cfg),
	}
}

func (c *workflowController) GetWorkflow(ctx *gin.Context) {
	idStr := ctx.Param("workflowID")

	workflowID, err := strconv.Atoi(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})

		return
	}

	user, ok := ctx.Get("user")
	if !ok {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "user not found"})
		return
	}

	userID := user.(*models.User).ID

	w, err := c.repo.GetWorkflow(ctx.Request.Context(), int32(workflowID))
	if err != nil {
		c.logger.WithError(err).Error("failed to get workflow")
		ctx.JSON(http.StatusNotFound, gin.H{"error": "workflow not found"})

		return
	}

	if userID != w.UserID {
		ctx.JSON(http.StatusForbidden, gin.H{"error": "unauthorized to view workflow"})
		return
	}

	ctx.JSON(http.StatusOK, w)
}

func (c *workflowController) GetUserWorkflows(ctx *gin.Context) {
	user, ok := ctx.Get("user")
	if !ok {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "user not found"})
		return
	}

	userID := user.(*models.User).ID

	w, err := c.repo.GetUserWorkflows(ctx.Request.Context(), userID)
	if err != nil {
		c.logger.WithError(err).Error("failed to get user workflows")
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

	user, ok := ctx.Get("user")
	if !ok {
		c.logger.Error("user not found")
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "user not found"})

		return
	}

	userID := user.(*models.User).ID

	workflow, err := c.workflowService.CreateWorkflow(
		ctx.Request.Context(),
		userID,
		req.Name,
		req.Description,
		req.Status,
		req.Nodes,
		req.Edges,
	)
	if err != nil {
		c.logger.Errorf("workflow creation error: %v", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create workflow"})

		return
	}

	ctx.JSON(http.StatusCreated, gin.H{"id": workflow.ID})
}

func (c *workflowController) UpdateWorkflow(ctx *gin.Context) {
	idStr := ctx.Param("workflowID")

	workflowID, err := strconv.Atoi(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})

		return
	}

	user, ok := ctx.Get("user")
	if !ok {
		c.logger.Error("user not found")
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "user not found"})

		return
	}

	userID := user.(*models.User).ID
	if err := c.workflowService.VerifyWorkflowAccess(ctx.Request.Context(), int32(workflowID), userID); err != nil {
		if err == services.ErrUserDoesNotHaveAccessToWorkflow {
			ctx.JSON(http.StatusForbidden, gin.H{"error": "unauthorized to update workflow"})

			return
		}

		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to verify workflow access"})

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

	if err := c.workflowService.UpdateWorkflow(
		ctx.Request.Context(),
		int32(workflowID),
		req.Name,
		req.Description,
		req.Nodes,
		req.Edges,
	); err != nil {
		c.logger.WithError(err).Error("failed to update workflow")
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "failed to update workflow"})

		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "workflow updated"})
}

func (c *workflowController) GetWorkflowRender(ctx *gin.Context) {
	idStr := ctx.Param("workflowID")

	workflowID, err := strconv.Atoi(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})

		return
	}

	user, ok := ctx.Get("user")
	if !ok {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "user not found"})
		return
	}

	userID := user.(*models.User).ID
	if err := c.workflowService.VerifyWorkflowAccess(ctx.Request.Context(), int32(workflowID), userID); err != nil {
		if err == services.ErrUserDoesNotHaveAccessToWorkflow {
			ctx.JSON(http.StatusForbidden, gin.H{"error": "unauthorized to view workflow"})

			return
		}

		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to verify workflow access"})

		return
	}

	wg, err := c.repo.RenderWorkflowGraph(ctx, int32(workflowID))
	if err != nil {
		c.logger.WithError(err).Error("failed to render workflow graph")
		ctx.JSON(http.StatusNotFound, gin.H{"error": "workflow not found"})

		return
	}

	ctx.JSON(http.StatusOK, wg)
}

func (c *workflowController) ArchiveWorkflow(ctx *gin.Context) {
	idStr := ctx.Param("workflowID")

	workflowID, err := strconv.Atoi(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	user, ok := ctx.Get("user")
	if !ok {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "user not found"})
		return
	}

	userID := user.(*models.User).ID
	if err := c.workflowService.VerifyWorkflowAccess(ctx.Request.Context(), int32(workflowID), userID); err != nil {
		if err == services.ErrUserDoesNotHaveAccessToWorkflow {
			ctx.JSON(http.StatusForbidden, gin.H{"error": "unauthorized to archive workflow"})

			return
		}

		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to verify workflow access"})

		return
	}

	err = c.workflowService.ArchiveWorkflow(ctx.Request.Context(), int32(workflowID))
	if err != nil {
		c.logger.WithError(err).Error("failed to archive workflow")
		ctx.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "failed to archive workflow", "details": err.Error()},
		)

		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "workflow archived"})
}
