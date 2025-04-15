package main

import (
	"time"

	"github.com/tinyautomator/tinyautomator-core/backend/config"
	repo "github.com/tinyautomator/tinyautomator-core/backend/repositories/timetrigger"
	"github.com/tinyautomator/tinyautomator-core/backend/services/timetrigger"
)

func main() {
	cfg, _ := config.NewAppConfig()
	cfg.Log().Info("Initializing worker")

	worker, err := timetrigger.NewWorker(10*time.Minute, repo.NewInMemoryRepository())
	if err != nil {
		cfg.Log().Fatalf("Failed to create worker: %v", err)
	}

	worker.StartScheduler()
	defer worker.StopScheduler()

	err = worker.PollAndSchedule()
	if err != nil {
		cfg.Log().Fatalf("Polling error in worker: %v", err)
	}
}
