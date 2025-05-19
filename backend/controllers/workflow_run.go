package controllers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/clients/redis"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
	"github.com/tinyautomator/tinyautomator-core/backend/services"
)

type WorkflowRunController interface {
	GetWorkflowRun(ctx *gin.Context)
	GetWorkflowRuns(ctx *gin.Context)
	GetWorkflowNodeRuns(ctx *gin.Context)
	RunWorkflow(ctx *gin.Context)
}

type workflowRunController struct {
	workflowRunRepo models.WorkflowRunRepository
	redis           redis.RedisClient
	orchestrator    models.OrchestratorService
	logger          logrus.FieldLogger
}

func NewWorkflowRunController(cfg models.AppConfig) *workflowRunController {
	return &workflowRunController{
		workflowRunRepo: cfg.GetWorkflowRunRepository(),
		redis:           cfg.GetRedisClient(),
		orchestrator:    services.NewOrchestratorService(cfg),
		logger:          cfg.GetLogger(),
	}
}

func (c *workflowRunController) GetWorkflowRun(ctx *gin.Context) {
	idStr := ctx.Param("id")

	workflowRunID, err := strconv.Atoi(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	workflowRun, err := c.workflowRunRepo.GetWorkflowRun(ctx, int32(workflowRunID))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get workflow run"})
		return
	}

	ctx.JSON(http.StatusOK, workflowRun)
}

func (c *workflowRunController) GetWorkflowRuns(ctx *gin.Context) {
	idStr := ctx.Param("id")

	workflowID, err := strconv.Atoi(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	workflowRuns, err := c.workflowRunRepo.GetWorkflowRuns(ctx, int32(workflowID))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get workflow runs"})
		return
	}

	ctx.JSON(http.StatusOK, workflowRuns)
}

func (c *workflowRunController) GetWorkflowNodeRuns(ctx *gin.Context) {
	idStr := ctx.Param("id")

	workflowRunID, err := strconv.Atoi(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	workflowNodeRuns, err := c.workflowRunRepo.GetWorkflowNodeRuns(ctx, int32(workflowRunID), nil)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get workflow node runs"})
		return
	}

	ctx.JSON(http.StatusOK, workflowNodeRuns)
}

func (c *workflowRunController) RunWorkflow(ctx *gin.Context) {
	idStr := ctx.Param("id")

	workflowID, err := strconv.Atoi(idStr)
	if err != nil {
		c.logger.Error("failed to convert id to int: %v", err)
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})

		return
	}

	lockID, acquired, err := c.redis.AcquireRunWorkflowLock(
		ctx,
		idStr,
		"test_user",
		500*time.Millisecond, // TODO: replace this later
	)
	if err != nil {
		c.logger.Error("failed to acquire workflow lock: %v", err)
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err})

		return
	}

	if !acquired {
		ctx.JSON(http.StatusConflict, gin.H{"error": "workflow already running"})
		return
	}

	// TODO: release the lock after the workflow is done
	c.logger.WithField("lock_id", lockID).Info("acquired run workflow lock")

	err = c.orchestrator.OrchestrateWorkflow(ctx, int32(workflowID))
	if err != nil {
		// TODO: don't return the error to the client
		c.logger.Error("failed to execute workflow: %v", err)
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err})

		return
	}

	ctx.JSON(http.StatusOK, workflowID)
}
