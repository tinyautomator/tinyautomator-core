package redis

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

func generateLockKey(workflowID, userID string) string {
	return fmt.Sprintf("lock:workflow:%s:user:%s", workflowID, userID)
}

func AcquireRunWorkflowLock(
	ctx context.Context,
	rc *redis.Client,
	workflowID, userID string,
	ttl time.Duration,
) (lockID string, acquired bool, err error) {
	key := generateLockKey(workflowID, userID)
	lockID = uuid.NewString()

	ok, err := rc.SetNX(ctx, key, lockID, ttl).Result()
	if err != nil {
		return "", false, fmt.Errorf("failed to acquire run workflow lock: %w", err)
	}

	return lockID, ok, nil
}

func ReleaseRunWorkflowLock(
	ctx context.Context,
	rc *redis.Client,
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

	_, err := releaseScript.Run(ctx, rc, []string{key}, lockID).Result()

	return fmt.Errorf("failed to release run workflow lock: %w", err)
}
