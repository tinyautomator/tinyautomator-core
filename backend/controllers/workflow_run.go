package controllers

import (
	"context"
	"encoding/json"
	"io"
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
	StreamWorkflowRunProgress(ctx *gin.Context)
}

type workflowRunController struct {
	workflowRunRepo    models.WorkflowRunRepository
	orchestrator       models.OrchestratorService
	logger             logrus.FieldLogger
	workflowRunService *services.WorkflowRunService
}

func NewWorkflowRunController(cfg models.AppConfig, ctx context.Context) *workflowRunController {
	c := &workflowRunController{
		workflowRunRepo:    cfg.GetWorkflowRunRepository(),
		orchestrator:       services.NewOrchestratorService(cfg),
		logger:             cfg.GetLogger(),
		workflowRunService: services.NewWorkflowRunService(cfg),
	}

	go c.workflowRunService.StartWorkflowRunProgressListener(ctx)

	return c
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
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid workflow id"})

		return
	}

	// TODO: ratelimit
	runID, err := c.orchestrator.OrchestrateWorkflow(ctx, int32(workflowID))
	if err != nil {
		// TODO: don't return the error to the client
		c.logger.WithError(err).Error("failed to execute workflow")
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err})

		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"run_id": runID,
	})
}

func (c *workflowRunController) StreamWorkflowRunProgress(ctx *gin.Context) {
	idStr := ctx.Param("id")

	runID, err := strconv.Atoi(idStr)
	if err != nil {
		c.logger.Error("failed to convert id to int: %v", err)
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid workflow id"})

		return
	}

	c.logger.WithField("runId", idStr).Info("sse connection request received")
	ctx.SSEvent("connection_established", gin.H{
		"message": "Successfully connected to progress stream for run " + idStr,
		"runId":   idStr,
	})
	ctx.Writer.Flush()

	if err := ctx.Request.Context().Err(); err != nil {
		c.logger.WithError(err).
			WithField("runId", idStr).
			Error("client disconnected after initial SSE event")

		return
	}

	c.logger.WithField("runId", idStr).Info("sent connection_established SSE event")

	clientChan := make(chan []byte, 10)
	c.workflowRunService.RegisterClient(idStr, clientChan)

	heartbeatInterval := 5 * time.Second
	ticker := time.NewTicker(heartbeatInterval)

	defer func() {
		ticker.Stop()
		c.workflowRunService.UnregisterClient(idStr, clientChan)
		close(clientChan)
		c.logger.WithField("runId", idStr).Info("sse client resources cleaned up")
	}()

	run, err := c.workflowRunService.GetWorkflowRunStatus(ctx, int32(runID))
	if err != nil {
		c.logger.WithError(err).Error("failed to get workflow run status")
		ctx.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "failed to get workflow run status"},
		)

		return
	}

	c.logger.WithFields(logrus.Fields{
		"runId":   runID,
		"status":  run.Status,
		"details": run.Nodes,
	}).Info("workflow run status")

	ctx.Writer.Header().Set("Access-Control-Allow-Origin", "*")

	if run.Status == "success" {
		ctx.SSEvent("workflow_run_completed", gin.H{
			"message": "Workflow run completed",
			"runId":   idStr,
		})
		ctx.Writer.Flush()

		return
	}

	for _, node := range run.Nodes {
		ctx.SSEvent("node_update", gin.H{
			"runId":  idStr,
			"nodeId": node.WorkflowNodeID,
			"status": node.Status,
		})
		ctx.Writer.Flush()

		if err := ctx.Request.Context().Err(); err != nil {
			c.logger.WithError(err).
				WithField("runId", idStr).
				Error("client disconnected after sending node_update sse event")

			return
		}
	}

	ctx.Stream(func(w io.Writer) bool {
		select {
		case <-ctx.Request.Context().Done():
			c.logger.WithField("runId", idStr).Info("sse client disconnected (context done)")
			return false
		case messageBytes, ok := <-clientChan:
			if !ok {
				c.logger.WithField("runId", idStr).
					Info("sse client channel closed in ctx.Stream callback")
				return false
			}

			var updateEvent redis.NodeStatusUpdate
			if err := json.Unmarshal(messageBytes, &updateEvent); err != nil {
				c.logger.WithError(err).WithFields(logrus.Fields{
					"runId":   idStr,
					"payload": string(messageBytes),
				}).Error("failed to unmarshal NodeStatusUpdate for sse")

				return true
			}

			ctx.SSEvent("node_update", updateEvent)

			if err := ctx.Request.Context().Err(); err != nil {
				c.logger.WithError(err).
					WithField("runId", idStr).
					Error("client disconnected after sending node_update sse event")

				return true
			}

			c.logger.WithField("runId", idStr).Debug("sent node_update sse event")

			return true

		case <-ticker.C:
			heartbeatMessage := "event: heartbeat\ndata: \"ping\"\n\n"
			if _, err := w.Write([]byte(heartbeatMessage)); err != nil {
				c.logger.WithError(err).
					WithField("runId", idStr).
					Error("error writing heartbeat sse event")

				return false
			}

			c.logger.WithField("runId", idStr).Debug("sent sse heartbeat")

			return true
		}
	})
}
