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
	var w *Worker

	var cfg config.AppConfig

	ctx, cancel := context.WithCancel(context.Background())

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		sig := <-sigChan
		fmt.Printf("received signal %s, shutting down...\n", sig)
		cancel()
	}()

	defer func() {
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
	w.StartScheduler()

	err = w.PollAndSchedule(ctx)
	if err != nil {
		panic(fmt.Errorf("error in poll & schedule loop: %v", err))
	}
}
