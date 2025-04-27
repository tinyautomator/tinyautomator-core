package main

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/config"
	"github.com/tinyautomator/tinyautomator-core/backend/db/dao"
	"github.com/tinyautomator/tinyautomator-core/backend/repositories"
	"github.com/tinyautomator/tinyautomator-core/backend/services"
)

type WorkerService struct {
	logger logrus.FieldLogger
	wg     sync.WaitGroup

	workflowScheduleRepo repositories.WorkflowScheduleRepository

	workflowExecutorSvc  *services.WorkflowExecutorService
	workflowSchedulerSvc *services.WorkflowSchedulerService
}

func NewWorkerService(cfg config.AppConfig) *WorkerService {
	return &WorkerService{
		workflowScheduleRepo: cfg.GetWorkflowScheduleRepository(),
		workflowExecutorSvc:  services.NewWorkflowExecutorService(cfg),
		workflowSchedulerSvc: services.NewWorkflowSchedulerService(cfg),
		logger:               cfg.GetLogger(),
	}
}

func (s *WorkerService) Shutdown() {
	s.logger.Info("Waiting for in-flight workflows to finish...")
	s.wg.Wait()
	s.logger.Info("Worker shutdown complete")
}

func (s *WorkerService) GetDueWorkflows(
	ctx context.Context,
) ([]*dao.WorkflowSchedule, error) {
	ws, err := s.workflowScheduleRepo.GetDueSchedulesLocked(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch due schedules from repo: %w", err)
	}

	return ws, nil
}

func (s *WorkerService) RunWorkflow(ctx context.Context, ws *dao.WorkflowSchedule) error {
	if ctx.Err() != nil {
		s.logger.WithField("workflow_id", ws.WorkflowID).Warn("ctx cancelled, skipping schedule")
		return nil
	}

	err := s.workflowSchedulerSvc.ValidateSchedule(ws)
	if err != nil {
		return fmt.Errorf("failed to validate schedule: %w", err)
	}

	s.wg.Add(1)

	go func() {
		defer s.wg.Done()

		if err := s.workflowExecutorSvc.ExecuteWorkflow(ctx, ws.WorkflowID); err != nil {
			s.logger.WithError(err).WithFields(logrus.Fields{
				"schedule_id": ws.ID,
				"workflow_id": ws.WorkflowID,
			}).Warn("workflow execution failed")
		}

		s.logger.WithFields(logrus.Fields{
			"schedule_id": ws.ID,
			"workflow_id": ws.WorkflowID,
		}).Info("workflow execution finished")

		now := time.Now().UnixMilli()
		nextRun := s.workflowSchedulerSvc.CalculateNextRun(ws.ScheduleType, now)

		if err := s.workflowScheduleRepo.UpdateNextRun(context.WithoutCancel(ctx), ws.ID, nextRun, now); err != nil {
			s.logger.WithError(err).
				WithField("workflow_id", ws.WorkflowID).
				Error("failed to update next_run_at")
		}
	}()

	return nil
}
