package main

import (
	"context"
	"fmt"

	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/clients/rabbitmq"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
	"github.com/tinyautomator/tinyautomator-core/backend/services"
)

type Worker struct {
	executor       models.ExecutorService
	rabbitMQClient rabbitmq.RabbitMQClient
	logger         logrus.FieldLogger
}

func NewWorker(cfg models.AppConfig) *Worker {
	return &Worker{
		executor:       services.NewExecutorService(cfg),
		rabbitMQClient: cfg.GetRabbitMQClient(),
		logger:         cfg.GetLogger(),
	}
}

func (w *Worker) Start(ctx context.Context) error {
	err := w.rabbitMQClient.Subscribe(
		ctx,
		func(msg []byte) error {
			return w.executor.ExecuteWorkflowNode(ctx, msg)
		},
	)
	if err != nil {
		return fmt.Errorf("failed to start worker: %w", err)
	}

	w.logger.Info("worker started successfully")

	return nil
}
