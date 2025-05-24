package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"sync"
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
	workflowRunRepo models.WorkflowRunRepository
	redisClient     redis.RedisClient
	orchestrator    models.OrchestratorService
	logger          logrus.FieldLogger

	activeRunSubscribers map[string]map[chan []byte]bool
	subscribersMutex     sync.RWMutex
}

func NewWorkflowRunController(cfg models.AppConfig, ctx context.Context) *workflowRunController {
	controller := &workflowRunController{
		workflowRunRepo:      cfg.GetWorkflowRunRepository(),
		redisClient:          cfg.GetRedisClient(),
		orchestrator:         services.NewOrchestratorService(cfg),
		logger:               cfg.GetLogger(),
		activeRunSubscribers: make(map[string]map[chan []byte]bool),
	}

	go controller.startRedisPubSubListener(ctx)

	return controller
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

	lockID, acquired, err := c.redisClient.AcquireRunWorkflowLock(
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
		c.logger.WithError(err).Error("failed to execute workflow")
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err})

		return
	}

	ctx.JSON(http.StatusOK, workflowID)
}

func (c *workflowRunController) StreamWorkflowRunProgress(ctx *gin.Context) {
	idStr := ctx.Param("id")

	_, err := strconv.Atoi(idStr)
	if err != nil {
		c.logger.Error("failed to convert id to int: %v", err)
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid workflow id"})

		return
	}

	c.logger.WithField("runId", idStr).Info("sse connection request received")

	clientChan := make(chan []byte, 10)
	c.registerClient(idStr, clientChan)

	heartbeatInterval := 5 * time.Second
	ticker := time.NewTicker(heartbeatInterval)

	defer func() {
		ticker.Stop()
		c.unregisterClient(idStr, clientChan)
		close(clientChan)
		c.logger.WithField("runId", idStr).Info("sse client resources cleaned up")
	}()

	ctx.Writer.Header().Set("Access-Control-Allow-Origin", "*")
	ctx.SSEvent("connection_established", gin.H{
		"message": "Successfully connected to progress stream for run " + idStr,
		"runId":   idStr,
	})
	ctx.Writer.Flush()

	c.logger.WithField("runId", idStr).Info("sent connection_established SSE event")

	if err := ctx.Request.Context().Err(); err != nil {
		c.logger.WithError(err).
			WithField("runId", idStr).
			Error("client disconnected after initial SSE event")

		return
	}

	ctx.Stream(func(w io.Writer) bool {
		select {
		case <-ctx.Request.Context().Done():
			c.logger.WithField("runId", idStr).Info("sse client disconnected (context done)")
			return false
		case messageBytes, ok := <-clientChan:
			if !ok {
				c.logger.WithField("runId", idStr).
					Info("SSE clientChan closed in c.Stream callback")
				return false
			}

			var updateEvent redis.NodeStatusUpdate
			if err := json.Unmarshal(messageBytes, &updateEvent); err != nil {
				c.logger.WithError(err).WithFields(logrus.Fields{
					"runId":   idStr,
					"payload": string(messageBytes),
				}).Error("failed to unmarshal NodeStatusUpdate for SSE")

				return true
			}

			ctx.SSEvent("node_update", updateEvent)

			if err := ctx.Request.Context().Err(); err != nil {
				c.logger.WithError(err).
					WithField("runId", idStr).
					Error("client disconnected after sending node_update SSE event")

				return true
			}

			c.logger.WithField("runId", idStr).Debug("sent node_update SSE event")

			return true

		case <-ticker.C:
			heartbeatMessage := "event: heartbeat\ndata: \"ping\"\n\n"
			if _, err := w.Write([]byte(heartbeatMessage)); err != nil {
				c.logger.WithError(err).
					WithField("runId", idStr).
					Error("error writing heartbeat event")

				return false
			}

			c.logger.WithField("runId", idStr).Debug("sent SSE heartbeat")

			return true
		}
	})
}

func (c *workflowRunController) startRedisPubSubListener(ctx context.Context) {
	c.logger.Info("starting redis pubsub listener for workflow progress")

	msgChan, pubsub, err := c.redisClient.SubscribeWorkflowProgress(ctx)
	if err != nil {
		c.logger.WithError(err).Error("failed to subscribe to redis for workflow progress")
		return
	}

	defer func() {
		if err := pubsub.Close(); err != nil {
			c.logger.WithError(err).Error("failed to close redis pubsub connection")
		}

		c.logger.Info("redis pubsub listener stopped")
	}()

	for redisMsg := range msgChan {
		c.logger.WithFields(logrus.Fields{
			"channel": redisMsg.Channel,
			"payload": redisMsg.Payload,
		}).Info("received message from redis pubsub")

		channelParts := strings.Split(redisMsg.Channel, ":")
		if len(channelParts) != 2 || channelParts[0] != "workflow-progress" {
			c.logger.WithField("channel", redisMsg.Channel).
				Warn("received message on unexpected redis channel format. skipping.")
			continue
		}

		runIDStr := channelParts[1]
		messageBytes := []byte(redisMsg.Payload)

		c.dispatchUpdate(runIDStr, messageBytes)
	}
}

func (c *workflowRunController) registerClient(runID string, clientChan chan []byte) {
	c.subscribersMutex.Lock()
	defer c.subscribersMutex.Unlock()

	if _, ok := c.activeRunSubscribers[runID]; !ok {
		c.activeRunSubscribers[runID] = make(map[chan []byte]bool)
	}

	c.activeRunSubscribers[runID][clientChan] = true

	c.logger.WithFields(logrus.Fields{
		"runId":      runID,
		"clientChan": fmt.Sprintf("%p", clientChan),
	}).Info("SSE client registered for progress updates")
}

func (c *workflowRunController) unregisterClient(runID string, clientChan chan []byte) {
	c.subscribersMutex.Lock()
	defer c.subscribersMutex.Unlock()

	if subscribers, ok := c.activeRunSubscribers[runID]; ok {
		if _, clientExists := subscribers[clientChan]; clientExists {
			delete(subscribers, clientChan)
			c.logger.WithFields(logrus.Fields{
				"runId":      runID,
				"clientChan": fmt.Sprintf("%p", clientChan),
			}).Info("SSE client unregistered")

			if len(subscribers) == 0 {
				delete(c.activeRunSubscribers, runID)
			}
		}
	}
}

func (c *workflowRunController) dispatchUpdate(runID string, messageBytes []byte) {
	c.subscribersMutex.RLock()
	defer c.subscribersMutex.RUnlock()

	subscribersForRun, ok := c.activeRunSubscribers[runID]
	if !ok {
		c.logger.WithField("runId", runID).Info("no sse clients to dispatch update to")
		return
	}

	c.logger.WithFields(logrus.Fields{
		"runId":          runID,
		"numSubscribers": len(subscribersForRun),
	}).Info("dispatching update to sse clients")

	for clientChan := range subscribersForRun {
		select {
		case clientChan <- messageBytes:
		default:
			c.logger.WithFields(logrus.Fields{
				"runId":      runID,
				"clientChan": fmt.Sprintf("%p", clientChan),
			}).Warn("failed to send message to sse client channel (buffer full or closed). message dropped for this client.")
		}
	}
}
