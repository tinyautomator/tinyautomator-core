package main

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/cmd/worker/scheduler"
	"github.com/tinyautomator/tinyautomator-core/backend/config"
	"github.com/tinyautomator/tinyautomator-core/backend/db/dao"
	"github.com/tinyautomator/tinyautomator-core/backend/repositories"
)

type WorkerService struct {
	repo      repositories.WorkflowScheduleRepository
	scheduler scheduler.WorkflowScheduler
	logger    logrus.FieldLogger
}

func NewWorkerService(cfg config.AppConfig) *WorkerService {
	l := cfg.GetLogger()
	// TODO: replace with dynamic scheduler backend selection
	s, err := scheduler.NewGoCronScheduler(cfg)
	if err != nil {
		panic(err)
	}

	return &WorkerService{
		repo:      cfg.GetWorkflowScheduleRepository(),
		scheduler: s,
		logger:    l,
	}
}

func (s *WorkerService) Start() {
	if err := s.scheduler.Start(); err != nil {
		panic(err)
	}
}

func (s *WorkerService) Shutdown() {
	if err := s.scheduler.Shutdown(); err != nil {
		panic(err)
	}
}

func (s *WorkerService) GetWorkflowsToSchedule(
	ctx context.Context,
	within time.Duration,
) ([]*dao.WorkflowSchedule, error) {
	ws, err := s.repo.GetWorkflowSchedules(ctx, within)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch due schedules from repo: %w", err)
	}

	return ws, nil
}

func (s *WorkerService) ScheduleWorkflow(ws *dao.WorkflowSchedule) error {
	err := s.validateSchedule(ws)
	if err != nil {
		s.logger.WithField("schedule_id", ws.ID).WithError(err).Error("failed to validate schedule")
		return err
	}

	if err := s.scheduler.Schedule(ws); err != nil {
		return fmt.Errorf("error scheduling workflow: %w", err)
	}

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
