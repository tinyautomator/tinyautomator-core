package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"runtime/debug"
	"syscall"
	"time"

	"github.com/tinyautomator/tinyautomator-core/backend/config"
)

func main() {
	var w *Worker

	// TODO: this was a good idea from claude; figure it out better
	ctx, cancel := context.WithCancel(context.Background())
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		sig := <-sigChan
		fmt.Printf("Received signal %s, shutting down...\n", sig)

		if w != nil {
			w.StopScheduler()
		}

		cancel() // Cancel the context which could be passed to PollAndSchedule
		// Give some time for operations to complete
		time.Sleep(2 * time.Second)
		os.Exit(0)
	}()

	defer func() {
		if r := recover(); r != nil {
			if w != nil {
				w.StopScheduler()
			}

			// TODO: The panic handling in the defer function is good, but
			// you could also consider setting up a signal handler for
			// graceful shutdown (e.g., SIGINT, SIGTERM).
			fmt.Fprintf(os.Stderr, "fatal error: %v\n", r)
			debug.PrintStack()
			os.Exit(1)
		}
	}()

	cfg, err := config.NewAppConfig()
	if err != nil {
		panic("failed to initialize config: " + err.Error())
	}

	logger := cfg.GetLogger()
	logger.Info("initializing worker")

	w = NewWorker(cfg)
	w.StartScheduler()

	err = w.PollAndSchedule(ctx)
	if err != nil {
		panic(fmt.Errorf("error while polling or scheduling: %v", err))
	}
}
