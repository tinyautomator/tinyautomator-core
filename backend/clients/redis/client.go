package redis

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/clients/google"
)

const (
	workflowProgressChannelPrefix = "workflow-progress"
)

type NodeStatusUpdate struct {
	RunID     int32          `json:"runId"`
	NodeID    int32          `json:"nodeId"`
	Status    string         `json:"status"`
	Timestamp time.Time      `json:"timestamp"`
	Details   map[string]any `json:"details,omitempty"`
}

type RedisClient interface {
	SetGmailToken(ctx context.Context, token google.GmailToken) error
	GetGmailToken(ctx context.Context) (google.GmailToken, error)
	InitializeRunningNodeSet(ctx context.Context, runID int32, nodeIDs []int32) error
	GetRunningNodeIDs(ctx context.Context, runID int32) (map[int32]struct{}, error)
	TryAcquireWorkflowRunFinalizationLock(ctx context.Context, runID int32) (bool, error)
	MarkNodeCompleteAndCountRemaining(
		ctx context.Context,
		runID int32,
		nodeID int32,
		nodeStatus string,
	) (*int, error)
	PublishNodeStatusUpdate(
		ctx context.Context,
		runID int32,
		nodeID int32,
		status string,
		details map[string]any,
	) error
	SubscribeWorkflowProgress(ctx context.Context) (<-chan *redis.Message, *redis.PubSub, error)
	Close() error
}

type redisClient struct {
	client *redis.Client
	logger logrus.FieldLogger
}

func NewRedisClient(url string, logger logrus.FieldLogger) (RedisClient, error) {
	client := redis.NewClient(&redis.Options{
		Addr: url,
		DB:   0,
	})

	if err := client.Ping(context.Background()).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to redis: %w", err)
	}

	return &redisClient{
		client: client,
		logger: logger,
	}, nil
}

func (c *redisClient) Close() error {
	if err := c.client.Close(); err != nil {
		return fmt.Errorf("failed to close redis client: %w", err)
	}

	return nil
}

// TODO: Remove this once we have a proper way to store the token
func (c *redisClient) SetGmailToken(ctx context.Context, token google.GmailToken) error {
	key := "gmail_token"

	payload, err := json.Marshal(token)
	if err != nil {
		return fmt.Errorf("failed to marshal gmail token: %w", err)
	}

	if err := c.client.Set(ctx, key, payload, 0).Err(); err != nil {
		return fmt.Errorf("failed to set gmail token: %w", err)
	}

	return nil
}

// TODO: Remove this once we have a proper way to store the token
func (c *redisClient) GetGmailToken(ctx context.Context) (google.GmailToken, error) {
	key := "gmail_token"

	payload, err := c.client.Get(ctx, key).Result()
	if err != nil {
		return google.GmailToken{}, fmt.Errorf("failed to get gmail token: %w", err)
	}

	var token google.GmailToken
	if err := json.Unmarshal([]byte(payload), &token); err != nil {
		return google.GmailToken{}, fmt.Errorf("failed to unmarshal gmail token: %w", err)
	}

	return token, nil
}

func (c *redisClient) generateRunningNodeSetKey(runID int32) string {
	return fmt.Sprintf("workflow_run:%d:running_nodes", runID)
}

func (c *redisClient) InitializeRunningNodeSet(
	ctx context.Context,
	runID int32,
	nodeIDs []int32,
) error {
	key := c.generateRunningNodeSetKey(runID)

	members := make([]interface{}, len(nodeIDs))
	for i, id := range nodeIDs {
		members[i] = id
	}

	if len(members) == 0 {
		c.logger.WithField("run_id", runID).Warn("called InitializeRunningNodeSet with no node IDs")
		return nil
	}

	if err := c.client.SAdd(ctx, key, members...).Err(); err != nil {
		c.logger.WithError(err).WithField("run_id", runID).Error("failed to SADD running node set")
		return fmt.Errorf("failed to SADD running node set: %w", err)
	}

	// TODO: add some observability to measure average workflow duration
	ttl := 30 * time.Minute
	if err := c.client.Expire(ctx, key, ttl).Err(); err != nil {
		c.logger.WithError(err).WithFields(logrus.Fields{
			"run_id": runID,
			"ttl":    ttl,
		}).Warn("failed to set TTL on running node set")
	}

	return nil
}

func (c *redisClient) GetRunningNodeIDs(
	ctx context.Context,
	runID int32,
) (map[int32]struct{}, error) {
	key := c.generateRunningNodeSetKey(runID)

	values, err := c.client.SMembers(ctx, key).Result()
	if err != nil {
		c.logger.WithError(err).
			WithField("run_id", runID).
			Warn("failed to fetch running node set from Redis")

		return nil, fmt.Errorf("failed to fetch running node set from Redis: %w", err)
	}

	nodeSet := make(map[int32]struct{}, len(values))

	for _, val := range values {
		id, err := strconv.ParseInt(val, 10, 32)
		if err != nil {
			c.logger.WithError(err).WithFields(logrus.Fields{
				"run_id": runID,
				"value":  val,
			}).Warn("non-integer value found in running node set")

			continue
		}

		nodeSet[int32(id)] = struct{}{}
	}

	return nodeSet, nil
}

func (c *redisClient) TryAcquireWorkflowRunFinalizationLock(
	ctx context.Context,
	runID int32,
) (bool, error) {
	key := fmt.Sprintf("workflow_run:%d:finalize_lock", runID)

	acquired, err := c.client.SetNX(ctx, key, "1", 5*time.Second).Result()
	if err != nil {
		return false, fmt.Errorf("failed to acquire workflow run finalization lock: %w", err)
	}

	return acquired, nil
}

func (c *redisClient) MarkNodeCompleteAndCountRemaining(
	ctx context.Context,
	runID int32,
	nodeID int32,
	nodeStatus string,
) (*int, error) {
	key := c.generateRunningNodeSetKey(runID)

	popNodeAndCountScript := redis.NewScript(`
		if redis.call("EXISTS", KEYS[1]) == 0 then
			return -1
		end
		redis.call("SREM", KEYS[1], ARGV[1])
		local remaining = redis.call("SCARD", KEYS[1])
		if remaining == 0 then
			redis.call("DEL", KEYS[1])
		end
		return remaining
	`)

	result, err := popNodeAndCountScript.Run(ctx, c.client, []string{key}, nodeID).Int()
	if err != nil {
		c.logger.WithError(err).WithFields(logrus.Fields{
			"run_id":  runID,
			"node_id": nodeID,
		}).Error("failed to mark node complete in redis")

		return nil, fmt.Errorf("failed to mark node complete in redis: %w", err)
	}

	if result == -1 {
		return nil, errors.New(
			"attempted to mark node complete but running node set did not exist in redis",
		)
	}

	return &result, nil
}

func (c *redisClient) generateProgressChannel(runID int32) string {
	return fmt.Sprintf("%s:%d", workflowProgressChannelPrefix, runID)
}

func (c *redisClient) PublishNodeStatusUpdate(
	ctx context.Context,
	runID int32,
	nodeID int32,
	status string,
	details map[string]any,
) error {
	channel := c.generateProgressChannel(runID)
	payload := NodeStatusUpdate{
		RunID:     runID,
		NodeID:    nodeID,
		Status:    status,
		Timestamp: time.Now().UTC(),
		Details:   details,
	}

	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		c.logger.WithError(err).WithFields(logrus.Fields{
			"run_id":  runID,
			"node_id": nodeID,
			"status":  status,
		}).Error("failed to marshal node status update payload")

		return fmt.Errorf("failed to marshal node status update payload: %w", err)
	}

	if err := c.client.Publish(ctx, channel, payloadBytes).Err(); err != nil {
		c.logger.WithError(err).WithFields(logrus.Fields{
			"run_id":  runID,
			"node_id": nodeID,
			"status":  status,
			"channel": channel,
		}).Error("failed to publish node status update to redis")

		return fmt.Errorf("failed to publish node status update to redis: %w", err)
	}

	c.logger.WithFields(logrus.Fields{
		"run_id":  runID,
		"node_id": nodeID,
		"status":  status,
		"channel": channel,
	}).Info("successfully published node status update")

	return nil
}

func (c *redisClient) SubscribeWorkflowProgress(
	ctx context.Context,
) (<-chan *redis.Message, *redis.PubSub, error) {
	pattern := fmt.Sprintf("%s:*", workflowProgressChannelPrefix)

	maxRetries := 5
	initialDelay := 2 * time.Second
	maxDelay := 60 * time.Second

	var err error

	currentDelay := initialDelay

	for attempt := range maxRetries {
		if err = c.client.Ping(ctx).Err(); err == nil {
			pubsub := c.client.PSubscribe(ctx, pattern)
			c.logger.Info("successfully subscribed to redis for workflow progress")

			return pubsub.Channel(), pubsub, nil
		}

		if attempt < maxRetries-1 {
			time.Sleep(currentDelay)

			currentDelay *= 2
			if currentDelay > maxDelay {
				currentDelay = maxDelay
			}
		}
	}

	return nil, nil, fmt.Errorf("failed to subscribe to redis for workflow progress: %w", err)
}
