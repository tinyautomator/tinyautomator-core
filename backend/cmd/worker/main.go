package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"

	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/config"
)

func main() {
	ctx := context.Background()

	// Initialize configuration
	cfg, err := config.NewAppConfig(ctx)
	if err != nil {
		logrus.WithError(err).Fatal("failed to initialize config")
	}

	// Create worker
	w, err := NewWorker(cfg)
	if err != nil {
		logrus.WithError(err).Fatal("failed to create worker")
	}

	// Start worker
	if err := w.Start(); err != nil {
		logrus.WithError(err).Fatal("failed to start worker")
	}

	// Wait for shutdown signal
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	<-sigChan

	// Shutdown gracefully
	w.Shutdown()
}
