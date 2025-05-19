package internal

import (
	"context"
	"errors"
	"fmt"

	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/clients/rabbitmq"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
)

var ErrNodeRunAlreadyExists = errors.New("node run already exists")

func EnqueueChildNodes(
	ctx context.Context,
	logger logrus.FieldLogger,
	workflowRepo models.WorkflowRepository,
	workflowRunRepo models.WorkflowRunRepository,
	rabbitMQClient rabbitmq.RabbitMQClient,
	workflowID int32,
	parentNodeID int32,
	runID int32,
) error {
	c, err := workflowRepo.GetChildNodeIDs(ctx, parentNodeID)
	if err != nil {
		return fmt.Errorf("failed to get child node ids: %w", err)
	}

	for _, childNodeID := range c {
		if err := workflowRunRepo.WithTransaction(ctx, func(txCtx context.Context, txRepo models.WorkflowRunRepository) error {
			nodeRunID, err := txRepo.CreateWorkflowNodeRun(ctx, runID, childNodeID)
			if err != nil {
				if errors.Is(err, ErrNodeRunAlreadyExists) {
					logger.WithField("node_id", childNodeID).Info("node run already exists, skipping enqueue")
					return nil
				}
				return fmt.Errorf("failed to create node run for child node %d: %w", childNodeID, err)
			}

			taskBytes, err := models.BuildWorkflowNodeTaskPayload(workflowID, runID, childNodeID, *nodeRunID)
			if err != nil {
				return fmt.Errorf("failed to marshal task for child node %d: %w", childNodeID, err)
			}

			err = rabbitMQClient.Publish(ctx, taskBytes)
			if err != nil {
				return fmt.Errorf("failed to dispatch task for child node %d: %w", childNodeID, err)
			}

			logger.WithFields(logrus.Fields{
				"node_id": childNodeID,
				"run_id":  runID,
			}).Info("successfully enqueued child node")

			return nil
		}); err != nil {
			logger.WithError(err).WithFields(logrus.Fields{
				"node_id": childNodeID,
				"run_id":  runID,
			}).Warn("enqueue child node failed and rolled back")
		}
	}

	return nil
}
