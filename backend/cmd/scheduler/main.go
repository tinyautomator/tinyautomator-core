package main

import (
	"log"
	"time"

	repo "github.com/tinyautomator/tinyautomator-core/backend/repositories/timetrigger"
	"github.com/tinyautomator/tinyautomator-core/backend/services/timetrigger"
)

func main() {
	log.Println("🕒 Starting TimeTrigger worker...")

	// Create the worker with desired polling interval
	worker, err := timetrigger.NewWorker(10*time.Minute, repo.NewInMemoryRepository())
	if err != nil {
		log.Fatalf("❌ Failed to create worker: %v", err)
	}

	// Start the underlying scheduler (required for gocron to run)
	worker.StartScheduler()
	defer worker.StopScheduler()

	// Start polling loop (blocking call)
	err = worker.PollAndSchedule()
	if err != nil {
		log.Printf("❌ Failed to save test trigger: %v", err)
	}
}
