package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
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
	logger   logrus.FieldLogger
	repo     repo.WorkflowRepository
	executor services.WorkflowExecutorService
}

type CreateWorkflowRequest struct {
	Name        string              `json:"name"        binding:"required"`
	Description string              `json:"description" binding:"required"`
	Nodes       []repo.WorkflowNode `json:"nodes"       binding:"required"`
	Edges       []repo.WorkflowEdge `json:"edges"       binding:"required"`
} // TODO: Look up validation libraries for the backend

func NewWorkflowController(cfg config.AppConfig) *workflowController {
	return &workflowController{
		logger:   cfg.GetLogger(),
		repo:     cfg.GetWorkflowRepository(),
		executor: *services.NewWorkflowExecutorService(cfg),
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

func (c *workflowController) CreateWorkflow(ctx *gin.Context) {
	var req CreateWorkflowRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
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

func (c *workflowController) RunWorkflow(ctx *gin.Context) {
	idStr := ctx.Param("id")

	workflowID, err := strconv.Atoi(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})

		return
	}

	err = c.executor.ExecuteWorkflow(ctx, int32(workflowID))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err})
	}

	ctx.JSON(http.StatusOK, workflowID)
}
