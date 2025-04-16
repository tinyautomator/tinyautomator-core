package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/tinyautomator/tinyautomator-core/backend/db/dao"
	repo "github.com/tinyautomator/tinyautomator-core/backend/repositories"
)

type WorkflowController interface {
	GetWorkflow(ctx *gin.Context)
	CreateWorkflow(ctx *gin.Context)
	GetWorkflowRender(ctx *gin.Context)
}

type workflowController struct {
	repo repo.WorkflowRepository
}

func NewWorkflowController(repo repo.WorkflowRepository) *workflowController {
	return &workflowController{repo}
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
	var req dao.CreateWorkflowParams
	if err := ctx.BindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	workflow, err := c.repo.CreateWorkflow(ctx.Request.Context(), &req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create workflow"})
		return
	}

	ctx.JSON(http.StatusCreated, workflow)
}

func (c *workflowController) GetWorkflowRender(ctx *gin.Context) {

}
