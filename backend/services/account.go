package services

import (
	"context"
	"fmt"

	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
)

type AccountService struct {
	logger       logrus.FieldLogger
	workflowRepo models.WorkflowRepository
	oauthRepo    models.OauthIntegrationRepository
}

func NewAccountService(
	cfg models.AppConfig,
) *AccountService {
	return &AccountService{
		logger:       cfg.GetLogger(),
		workflowRepo: cfg.GetWorkflowRepository(),
		oauthRepo:    cfg.GetOauthIntegrationRepository(),
	}
}

func (s *AccountService) DeleteUserData(ctx context.Context, userID string) error {
	workflows, err := s.workflowRepo.GetUserWorkflows(ctx, userID)
	if err != nil {
		s.logger.WithError(err).Error("Failed to fetch user workflows")
		return fmt.Errorf("failed to fetch user workflows: %w", err)
	}

	for _, workflow := range workflows {
		if err := s.workflowRepo.ArchiveWorkflow(ctx, workflow.ID); err != nil {
			s.logger.WithError(err).
				WithField("workflow_id", workflow.ID).
				Error("Failed to archive workflow")

			return fmt.Errorf("failed to archive workflow: %w", err)
		}
	}

	if err := s.oauthRepo.DeleteAllByUserID(ctx, userID); err != nil {
		s.logger.WithError(err).Error("Failed to delete user OAuth integrations")
		return fmt.Errorf("failed to delete user OAuth integrations: %w", err)
	}

	return nil
}
