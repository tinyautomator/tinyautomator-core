package redis

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
	"github.com/sirupsen/logrus"
)

type RedisClient interface {
	AcquireRunWorkflowLock(
		ctx context.Context,
		workflowID, userID string,
		ttl time.Duration,
	) (lockID string, acquired bool, err error)
	ReleaseRunWorkflowLock(ctx context.Context, workflowID, userID, lockID string) error
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

func generateLockKey(workflowID, userID string) string {
	return fmt.Sprintf("lock:workflow:%s:user:%s", workflowID, userID)
}

func (c *redisClient) AcquireRunWorkflowLock(
	ctx context.Context,
	workflowID, userID string,
	ttl time.Duration,
) (lockID string, acquired bool, err error) {
	key := generateLockKey(workflowID, userID)
	lockID = uuid.NewString()

	ok, err := c.client.SetNX(ctx, key, lockID, ttl).Result()
	if err != nil {
		return "", false, fmt.Errorf("failed to acquire run workflow lock: %w", err)
	}

	return lockID, ok, nil
}

func (c *redisClient) ReleaseRunWorkflowLock(
	ctx context.Context,
	workflowID, userID, lockID string,
) error {
	key := generateLockKey(workflowID, userID)

	releaseScript := redis.NewScript(`
		if redis.call("get", KEYS[1]) == ARGV[1] then
			return redis.call("del", KEYS[1])
		else
			return 0
		end
	`)

	_, err := releaseScript.Run(ctx, c.client, []string{key}, lockID).Result()
	if err != nil {
		return fmt.Errorf("failed to release run workflow lock: %w", err)
	}

	return nil
}
