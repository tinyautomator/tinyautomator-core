package main

import (
	"log"
	"time"

	"github.com/tinyautomator/tinyautomator-core/backend/models"
	"github.com/tinyautomator/tinyautomator-core/backend/services/timetrigger"
)

func main() {
	log.Println("🕒 Starting TimeTrigger worker...")

	// Create the worker with desired polling interval
	worker, err := timetrigger.NewWorker(10 * time.Minute)
	if err != nil {
		log.Fatalf("❌ Failed to create worker: %v", err)
	}
	repo := worker.GetServiceRepo()

	now := time.Now().UTC().Add(2 * time.Minute)
	timeFormat := now.Format("15:04")
	repo.SaveTrigger(models.TimeTrigger{
		ID:         1,
		Interval:   "daily",
		TriggerAt:  timeFormat, // invalid
		NextRun:    time.Now().UTC().Add(2 * time.Minute),
		Action:     "send_email",
	})
	repo.SaveTrigger(models.TimeTrigger{
		ID:         2,
		Interval:   "daily",
		TriggerAt:  timeFormat, // invalid
		NextRun:    time.Now().UTC().Add(5 * time.Minute),
		Action:     "send_email",
	})
	
	// Start the underlying scheduler (required for gocron to run)
	worker.StartScheduler()
	defer worker.StopScheduler()

	// Start polling loop (blocking call)
	err = worker.PollAndSchedule()
	if err != nil{
		log.Printf("❌ Failed to save test trigger: %v", err)
	}
}
