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
	workflowRunID int32,
) error {
	c, err := workflowRepo.GetChildNodeIDs(ctx, parentNodeID)
	if err != nil {
		return fmt.Errorf("failed to get child node ids: %w", err)
	}

	type NodeToEnqueue struct {
		NodeID    int32
		NodeRunID int32
	}

	nodesNotAlreadyQueued := []NodeToEnqueue{}

	for _, childNodeID := range c {
		nodeRun, err := workflowRunRepo.GetWorkflowNodeRun(ctx, workflowRunID, childNodeID)
		if err != nil {
			return fmt.Errorf("failed to get node run for child node %d: %w", childNodeID, err)
		}

		if nodeRun.Status != "pending" {
			logger.WithFields(logrus.Fields{
				"workflow_id":     workflowID,
				"workflow_run_id": workflowRunID,
				"node_id":         childNodeID,
				"node_run_id":     nodeRun.ID,
			}).Info("node run already in progress, skipping enqueue")

			continue
		}

		nodesNotAlreadyQueued = append(nodesNotAlreadyQueued, NodeToEnqueue{
			NodeID:    childNodeID,
			NodeRunID: nodeRun.ID,
		})
	}

	for _, n := range nodesNotAlreadyQueued {
		taskBytes, err := models.BuildWorkflowNodeTaskPayload(
			workflowID,
			workflowRunID,
			n.NodeID,
			n.NodeRunID,
		)
		if err != nil {
			return fmt.Errorf("failed to marshal task for child node %d: %w", n.NodeID, err)
		}

		err = rabbitMQClient.Publish(ctx, taskBytes)
		if err != nil {
			return fmt.Errorf("failed to publish message for child node %d: %w", n.NodeID, err)
		}

		logger.WithFields(logrus.Fields{
			"workflow_id":     workflowID,
			"workflow_run_id": workflowRunID,
			"node_id":         n.NodeID,
			"node_run_id":     n.NodeRunID,
		}).Info("successfully enqueued child node")
	}

	return nil
}
