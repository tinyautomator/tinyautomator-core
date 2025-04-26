package main

import (
	"context"
	"errors"
	"fmt"
	"sync"
	"time"

	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/config"
	"github.com/tinyautomator/tinyautomator-core/backend/db/dao"
	"github.com/tinyautomator/tinyautomator-core/backend/repositories"
)

type WorkerService struct {
	repo   repositories.WorkflowScheduleRepository
	logger logrus.FieldLogger
	wg     sync.WaitGroup
}

func NewWorkerService(cfg config.AppConfig) *WorkerService {
	l := cfg.GetLogger()

	return &WorkerService{
		repo:   cfg.GetWorkflowScheduleRepository(),
		logger: l,
	}
}

func (s *WorkerService) Shutdown() {
	s.logger.Info("Waiting for in-flight workflows to finish...")
	s.wg.Wait()
	s.logger.Info("Worker shutdown complete")
}

func (s *WorkerService) GetScheduledWorkflows(
	ctx context.Context,
) ([]*dao.WorkflowSchedule, error) {
	ws, err := s.repo.GetDueSchedulesLocked(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch due schedules from repo: %w", err)
	}

	return ws, nil
}

func (s *WorkerService) ScheduleWorkflow(ctx context.Context, ws *dao.WorkflowSchedule) error {
	if ctx.Err() != nil {
		s.logger.WithField("workflow_id", ws.WorkflowID).Warn("ctx cancelled, skipping schedule")
		return nil
	}

	err := s.validateSchedule(ws)
	if err != nil {
		s.logger.WithField("schedule_id", ws.ID).WithError(err).Error("failed to validate schedule")
		return err
	}

	s.wg.Add(1)

	go func() {
		defer s.wg.Done()

		// TODO: add logic to execute workflow here
		time.Sleep(10 * time.Second) // simulate job run

		s.logger.WithFields(logrus.Fields{
			"schedule_id": ws.ID,
			"workflow_id": ws.WorkflowID,
		}).Info("workflow execution finished")

		now := time.Now().UnixMilli()
		nextRun := s.calculateNextRun(ws.ScheduleType, now)

		if err := s.repo.UpdateNextRun(context.Background(), ws.ID, nextRun, now); err != nil {
			s.logger.WithError(err).
				WithField("workflow_id", ws.WorkflowID).
				Error("failed to update next_run_at")
		}
	}()

	return nil
}

func (s *WorkerService) validateSchedule(ws *dao.WorkflowSchedule) error {
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

func (s *WorkerService) calculateNextRun(scheduleType string, now int64) *int64 {
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
