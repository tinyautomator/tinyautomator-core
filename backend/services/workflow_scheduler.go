package services

import (
	"errors"
	"fmt"
	"time"

	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/config"
	"github.com/tinyautomator/tinyautomator-core/backend/db/dao"
)

type WorkflowSchedulerService struct {
	logger logrus.FieldLogger
}

func NewWorkflowSchedulerService(cfg config.AppConfig) *WorkflowSchedulerService {
	return &WorkflowSchedulerService{
		logger: cfg.GetLogger(),
	}
}

func (s *WorkflowSchedulerService) ValidateSchedule(ws *dao.WorkflowSchedule) error {
	switch ws.ScheduleType {
	case "once", "daily", "weekly", "monthly":
		// TODO: instrument
	default:
		return fmt.Errorf("invalid schedule_type: %s", ws.ScheduleType)
	}

	if !ws.NextRunAt.Valid || ws.NextRunAt.Int64 <= 0 {
		return errors.New("next_run_at must be a valid positive timestamp")
	}

	return nil
}

// TODO: change this to be part of the UpdateNextRun service logic
func (s *WorkflowSchedulerService) CalculateNextRun(scheduleType string, now int64) *int64 {
	var t int64

	switch scheduleType {
	case "daily":
		t = now + int64(24*time.Hour/time.Millisecond)
		return &t
	case "weekly":
		t = now + int64(7*24*time.Hour/time.Millisecond)
		return &t
	case "monthly":
		t = now + int64(30*24*time.Hour/time.Millisecond)
		return &t
	default: // once or invalid
		return nil
	}
}
