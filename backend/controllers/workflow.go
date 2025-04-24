package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/config"
	repo "github.com/tinyautomator/tinyautomator-core/backend/repositories"
)

type WorkflowController interface {
	GetWorkflow(ctx *gin.Context)
	CreateWorkflow(ctx *gin.Context)
	GetWorkflowRender(ctx *gin.Context)
}

type workflowController struct {
	logger logrus.FieldLogger
	repo   repo.WorkflowRepository
}

type CreateWorkflowRequest struct {
	Name        string              `json:"name"        binding:"required"`
	Description string              `json:"description" binding:"required"`
	Nodes       []repo.WorkflowNode `json:"nodes"       binding:"required"`
	Edges       []repo.WorkflowEdge `json:"edges"       binding:"required"`
} // TODO: Look up validation libraries for the backend

func NewWorkflowController(cfg config.AppConfig) *workflowController {
	return &workflowController{
		logger: cfg.GetLogger(),
		repo:   cfg.GetWorkflowRepository(),
	}
}

func (c *workflowController) GetWorkflow(ctx *gin.Context) {
	idStr := ctx.Param("id")

	id, err := strconv.Atoi(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})

		return
	}

	workflow, err := c.repo.GetWorkflow(ctx.Request.Context(), int64(id))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "workflow not found"})

		return
	}

	ctx.JSON(http.StatusOK, workflow)
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
}
