package main

import (
	"context"
	"fmt"

	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/clients/rabbitmq"
	"github.com/tinyautomator/tinyautomator-core/backend/config"
	"github.com/tinyautomator/tinyautomator-core/backend/services"
)

type Worker struct {
	config             config.AppConfig
	executor           *services.ExecutorService
	rabbitMQClient     rabbitmq.RabbitMQClient
	logger             logrus.FieldLogger
	shutdownCtx        context.Context
	shutdownCancelFunc context.CancelFunc
}

func NewWorker(cfg config.AppConfig) *Worker {
	ctx, cancel := context.WithCancel(context.Background())

	return &Worker{
		config:             cfg,
		executor:           services.NewExecutorService(cfg),
		rabbitMQClient:     cfg.GetRabbitMQClient(),
		logger:             cfg.GetLogger(),
		shutdownCtx:        ctx,
		shutdownCancelFunc: cancel,
	}
}

func (w *Worker) Start() error {
	// TODO: group these by projected cost
	routingKeys := []string{
		"node.schedule",
		"node.send_email",
		"node.send_sms",
		// Add other node types as needed
	}

	// Start consuming messages
	err := w.rabbitMQClient.Subscribe(
		w.shutdownCtx,
		"workflow_node_taskqueue",
		routingKeys,
		func(msg []byte) error {
			return w.executor.ExecuteWorkflowNode(w.shutdownCtx, msg)
		},
	)
	if err != nil {
		return fmt.Errorf("failed to start worker: %w", err)
	}

	w.logger.Info("worker started successfully")

	return nil
}

func (w *Worker) Shutdown() {
	w.logger.Info("shutting down worker...")
	w.shutdownCancelFunc()
	w.logger.Info("worker shutdown complete")
}
