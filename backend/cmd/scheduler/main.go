package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"runtime/debug"
	"syscall"

	"github.com/tinyautomator/tinyautomator-core/backend/config"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
)

func main() {
	var (
		s   *Scheduler
		cfg models.AppConfig
	)

	defer func() {
		if r := recover(); r != nil {
			fmt.Fprintf(os.Stderr, "fatal error: %v\n", r)
			debug.PrintStack()
			os.Exit(1)
		}
	}()

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	defer func() {
		if s != nil {
			s.StopScheduler()
		}

		if cfg != nil {
			cfg.CleanUp()
		}
	}()

	cfg, err := config.NewAppConfig(ctx)
	if err != nil {
		panic("failed to initialize config: " + err.Error())
	}

	logger := cfg.GetLogger()
	logger.Info("initializing scheduler")

	s = NewScheduler(cfg)

	go func() {
		err = s.PollAndRunScheduledWorkflows(ctx)
		if err != nil {
			panic(fmt.Errorf("error in poll & run workflow loop: %v", err))
		}
	}()

	<-ctx.Done()
	logger.Info("signal received - shutting down gracefully")
}
