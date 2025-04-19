package main

import (
	"fmt"
	"os"
	"runtime/debug"

	"github.com/tinyautomator/tinyautomator-core/backend/cmd/scheduler/worker"
	"github.com/tinyautomator/tinyautomator-core/backend/config"
)

func main() {
	var w *worker.Worker

	defer func() {
		if r := recover(); r != nil {
			if w != nil {
				w.StopScheduler()
			}

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

	w, err = worker.NewWorker(cfg)
	if err != nil {
		panic(fmt.Errorf("failed to create worker: %w", err))
	}

	w.StartScheduler()

	err = w.PollAndSchedule()
	if err != nil {
		logger.Errorf("polling error in worker: %v", err)
		panic(err)
	}
}
