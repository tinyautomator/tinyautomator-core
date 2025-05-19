package main

import (
	"context"
	"fmt"
	"os/signal"
	"syscall"

	"github.com/tinyautomator/tinyautomator-core/backend/config"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	cfg, err := config.NewAppConfig(ctx)
	if err != nil {
		panic("failed to initialize config " + err.Error())
	}
	defer cfg.CleanUp()

	logger := cfg.GetLogger()
	logger.Info("initializing worker")

	w := NewWorker(cfg)

	if err := w.Start(ctx); err != nil {
		panic(fmt.Errorf("error in starting worker: %v", err))
	}

	<-ctx.Done()
	logger.Info("signal received - shutting down gracefully")
}
