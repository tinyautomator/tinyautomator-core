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

type NodeToEnqueue struct {
	NodeID    int32
	NodeRunID int32
}

func EnqueueNode(
	ctx context.Context,
	logger logrus.FieldLogger,
	workflowRunRepo models.WorkflowRunRepository,
	rabbitMQClient rabbitmq.RabbitMQClient,
	userID string,
	workflowID int32,
	workflowRunID int32,
	nodeID int32,
) error {
	nodeRun, err := workflowRunRepo.GetWorkflowNodeRun(ctx, workflowRunID, nodeID)
	if err != nil {
		return fmt.Errorf("failed to get workflow node run: %w", err)
	}

	if nodeRun.Status != "pending" {
		logger.WithFields(logrus.Fields{
			"user_id":         userID,
			"workflow_id":     workflowID,
			"workflow_run_id": workflowRunID,
			"node_id":         nodeRun.WorkflowNodeID,
			"node_run_id":     nodeRun.ID,
			"node_status":     nodeRun.Status,
		}).Info("node run already in progress, skipping enqueue")

		return nil
	}

	taskBytes, err := models.BuildWorkflowNodeTaskPayload(
		userID,
		workflowID,
		workflowRunID,
		nodeID,
		nodeRun.ID,
	)
	if err != nil {
		return fmt.Errorf("failed to marshal task for child node %d: %w", nodeID, err)
	}

	err = rabbitMQClient.Publish(ctx, taskBytes)
	if err != nil {
		return fmt.Errorf("failed to publish message for child node %d: %w", nodeID, err)
	}

	logger.WithFields(logrus.Fields{
		"user_id":         userID,
		"workflow_id":     workflowID,
		"workflow_run_id": workflowRunID,
		"node_id":         nodeID,
		"node_run_id":     nodeRun.ID,
	}).Info("successfully enqueued node")

	return nil
}

func EnqueueChildNodes(
	ctx context.Context,
	logger logrus.FieldLogger,
	workflowRunRepo models.WorkflowRunRepository,
	rabbitMQClient rabbitmq.RabbitMQClient,
	userID string,
	workflowID int32,
	parentNodeID int32,
	workflowRunID int32,
) error {
	c, err := workflowRunRepo.GetChildWorkflowNodeRuns(ctx, workflowRunID, parentNodeID)
	if err != nil {
		return fmt.Errorf("failed to get child workflow node runs: %w", err)
	}

	if len(c) == 0 {
		logger.WithFields(logrus.Fields{
			"user_id":         userID,
			"workflow_id":     workflowID,
			"workflow_run_id": workflowRunID,
			"node_id":         parentNodeID,
		}).Info("no child nodes to enqueue")

		return nil
	}

	nodesNotAlreadyQueued := []NodeToEnqueue{}

	logger.WithFields(logrus.Fields{
		"user_id":         userID,
		"child_node_runs": c,
		"n_nodes":         len(c),
	}).Info("enqueuing child nodes")

	for _, nodeRun := range c {
		if nodeRun.Status != "pending" {
			logger.WithFields(logrus.Fields{
				"user_id":         userID,
				"workflow_id":     workflowID,
				"workflow_run_id": workflowRunID,
				"node_id":         nodeRun.WorkflowNodeID,
				"node_run_id":     nodeRun.ID,
				"node_status":     nodeRun.Status,
			}).Info("node run already in progress, skipping enqueue")

			continue
		}

		nodesNotAlreadyQueued = append(nodesNotAlreadyQueued, NodeToEnqueue{
			NodeID:    nodeRun.WorkflowNodeID,
			NodeRunID: nodeRun.ID,
		})
	}

	for _, n := range nodesNotAlreadyQueued {
		taskBytes, err := models.BuildWorkflowNodeTaskPayload(
			userID,
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
			"user_id":         userID,
			"workflow_id":     workflowID,
			"workflow_run_id": workflowRunID,
			"node_id":         n.NodeID,
			"node_run_id":     n.NodeRunID,
		}).Info("successfully enqueued child node")
	}

	return nil
}
