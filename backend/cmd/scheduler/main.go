package main

import (
	"time"

	"github.com/tinyautomator/tinyautomator-core/backend/cmd/scheduler/worker"
	"github.com/tinyautomator/tinyautomator-core/backend/config"
	repo "github.com/tinyautomator/tinyautomator-core/backend/repositories/timetrigger"
)

func main() {
	cfg, err := config.NewAppConfig()

	if err != nil {
		panic("Failed to initialize config " + err.Error())
	}

	cfg.GetLogger().Info("Initializing worker")

	worker, err := worker.NewWorker(10*time.Minute, repo.NewInMemoryRepository())
	if err != nil {
		cfg.GetLogger().Fatalf("Failed to create worker: %v", err)
	}

	worker.StartScheduler()
	defer worker.StopScheduler()

	err = worker.PollAndSchedule()
	if err != nil {
		cfg.GetLogger().Fatalf("Polling error in worker: %v", err)
	}
}
