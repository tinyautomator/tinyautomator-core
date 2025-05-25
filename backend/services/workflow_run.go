package services

import (
	"context"
	"fmt"
	"strings"
	"sync"

	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/clients/redis"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
)

type WorkflowRunService struct {
	workflowRunRepo models.WorkflowRunRepository
	redisClient     redis.RedisClient
	logger          logrus.FieldLogger

	activeRunSubscribers map[string]map[chan []byte]bool
	subscribersMutex     sync.RWMutex
}

func NewWorkflowRunService(cfg models.AppConfig) *WorkflowRunService {
	service := &WorkflowRunService{
		workflowRunRepo:      cfg.GetWorkflowRunRepository(),
		redisClient:          cfg.GetRedisClient(),
		logger:               cfg.GetLogger(),
		activeRunSubscribers: make(map[string]map[chan []byte]bool),
	}

	return service
}

func (s *WorkflowRunService) GetWorkflowRunStatus(
	ctx context.Context,
	runID int32,
) (*models.WorkflowRunWithNodesDTO, error) {
	run, err := s.workflowRunRepo.GetWorkflowRun(ctx, runID)
	if err != nil {
		return nil, fmt.Errorf("failed to get workflow run status: %w", err)
	}

	return run, nil
}

func (s *WorkflowRunService) StartWorkflowRunProgressListener(ctx context.Context) {
	s.logger.Info("starting redis pubsub listener for workflow progress")

	msgChan, pubsub, err := s.redisClient.SubscribeWorkflowProgress(ctx)
	if err != nil {
		s.logger.WithError(err).Error("failed to subscribe to redis for workflow progress")
		return
	}

	defer func() {
		if err := pubsub.Close(); err != nil {
			s.logger.WithError(err).Error("failed to close redis pubsub connection")
		}

		s.logger.Info("redis pubsub listener stopped")
	}()

	for redisMsg := range msgChan {
		s.logger.WithFields(logrus.Fields{
			"channel": redisMsg.Channel,
			"payload": redisMsg.Payload,
		}).Info("received message from redis pubsub")

		channelParts := strings.Split(redisMsg.Channel, ":")
		if len(channelParts) != 2 || channelParts[0] != "workflow-progress" {
			s.logger.WithField("channel", redisMsg.Channel).
				Warn("received message on unexpected redis channel format. skipping.")
			continue
		}

		runIDStr := channelParts[1]
		messageBytes := []byte(redisMsg.Payload)

		s.dispatchUpdate(runIDStr, messageBytes)
	}
}

func (s *WorkflowRunService) dispatchUpdate(runID string, messageBytes []byte) {
	s.subscribersMutex.RLock()
	defer s.subscribersMutex.RUnlock()

	subscribersForRun, ok := s.activeRunSubscribers[runID]
	if !ok {
		s.logger.WithField("runId", runID).Info("no sse clients to dispatch update to")
		return
	}

	s.logger.WithFields(logrus.Fields{
		"runId":          runID,
		"numSubscribers": len(subscribersForRun),
	}).Info("dispatching update to sse clients")

	for clientChan := range subscribersForRun {
		select {
		case clientChan <- messageBytes:
		default:
			s.logger.WithFields(logrus.Fields{
				"runId":      runID,
				"clientChan": fmt.Sprintf("%p", clientChan),
			}).Warn("failed to send message to sse client channel (buffer full or closed). message dropped for this client.")
		}
	}
}

func (s *WorkflowRunService) RegisterClient(runID string, clientChan chan []byte) {
	s.subscribersMutex.Lock()
	defer s.subscribersMutex.Unlock()

	if _, ok := s.activeRunSubscribers[runID]; !ok {
		s.activeRunSubscribers[runID] = make(map[chan []byte]bool)
	}

	s.activeRunSubscribers[runID][clientChan] = true

	s.logger.WithFields(logrus.Fields{
		"runId":      runID,
		"clientChan": fmt.Sprintf("%p", clientChan),
	}).Info("sse client registered for progress updates")
}

func (s *WorkflowRunService) UnregisterClient(runID string, clientChan chan []byte) {
	s.subscribersMutex.Lock()
	defer s.subscribersMutex.Unlock()

	if subscribers, ok := s.activeRunSubscribers[runID]; ok {
		if _, clientExists := subscribers[clientChan]; clientExists {
			delete(subscribers, clientChan)
			s.logger.WithFields(logrus.Fields{
				"runId":      runID,
				"clientChan": fmt.Sprintf("%p", clientChan),
			}).Info("sse client unregistered")

			if len(subscribers) == 0 {
				delete(s.activeRunSubscribers, runID)
			}
		}
	}
}
