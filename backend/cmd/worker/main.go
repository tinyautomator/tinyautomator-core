package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"runtime/debug"
	"syscall"

	"github.com/tinyautomator/tinyautomator-core/backend/config"
)

func main() {
	var (
		w   *Worker
		cfg config.AppConfig
	)

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	defer func() {
		// TODO: remove
		panicErr := recover()

		if w != nil {
			w.StopScheduler()
		}

		if cfg != nil {
			cfg.CleanUp()
		}

		if panicErr != nil {
			fmt.Fprintf(os.Stderr, "fatal error: %v\n", panicErr)
			debug.PrintStack()
			os.Exit(1)
		}
	}()

	cfg, err := config.NewAppConfig(ctx)
	if err != nil {
		panic("failed to initialize config: " + err.Error())
	}

	logger := cfg.GetLogger()
	logger.Info("initializing worker")

	w = NewWorker(cfg)

	go func() {
		err = w.PollAndSchedule(ctx)
		if err != nil {
			panic(fmt.Errorf("error in poll & schedule loop: %v", err))
		}
	}()

	<-ctx.Done()
	logger.Info("signal received - shutting down gracefully")
}
