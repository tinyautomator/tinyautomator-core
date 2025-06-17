package services

import (
	"context"
	"fmt"
	"slices"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/sirupsen/logrus"
	"golang.org/x/oauth2"
	"google.golang.org/api/gmail/v1"

	"github.com/tinyautomator/tinyautomator-core/backend/clients/google"
	"github.com/tinyautomator/tinyautomator-core/backend/clients/redis"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
)

type WorkflowEmailService struct {
	logger logrus.FieldLogger
	wg     sync.WaitGroup

	workflowEmailRepo       models.WorkflowEmailRepository
	orchestrator            models.OrchestratorService
	oauthIntegrationService models.OauthIntegrationService
	oauthConfig             *oauth2.Config
	redisClient             redis.RedisClient
}

func NewWorkflowEmailService(cfg models.AppConfig) models.WorkflowEmailService {
	return &WorkflowEmailService{
		logger:                  cfg.GetLogger(),
		workflowEmailRepo:       cfg.GetWorkflowEmailRepository(),
		orchestrator:            cfg.GetOrchestratorService(),
		oauthIntegrationService: cfg.GetOauthIntegrationService(),
		oauthConfig:             cfg.GetGoogleOAuthConfig(),
		redisClient:             cfg.GetRedisClient(),
	}
}

func (s *WorkflowEmailService) InitGmailClient(
	ctx context.Context,
	userID string,
) (*google.GmailClient, error) {
	token, err := s.oauthIntegrationService.GetToken(ctx, userID, "google", s.oauthConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to get oauth integration: %w", err)
	}

	client, err := google.InitGmailClient(ctx, token, s.oauthConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to init gmail client: %w", err)
	}

	return client, nil
}

func (s *WorkflowEmailService) EnsureInFlightEnqueued() {
	s.wg.Add(1)

	go func() {
		defer s.wg.Done()
	}()
}

func (s *WorkflowEmailService) ValidateEmailConfig(config models.WorkflowEmailConfig) error {
	return nil
}

func (s *WorkflowEmailService) GetActiveEmails(
	ctx context.Context,
) ([]*models.WorkflowEmail, error) {
	rows, err := s.workflowEmailRepo.GetActiveWorkflowEmailsLocked(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get active emails: %w", err)
	}

	return rows, nil
}

func (s *WorkflowEmailService) GetHistoryID(
	ctx context.Context,
	emailID string,
	userID string,
) (*uint64, error) {
	client, err := s.InitGmailClient(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to init gmail client: %w", err)
	}

	historyID, err := client.GetHistoryID(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get history id: %w", err)
	}

	return historyID, nil
}

func (s *WorkflowEmailService) CreateWorkflowEmail(
	ctx context.Context,
	workflowID int32,
	config models.WorkflowEmailConfig,
	historyID string,
	executionState string,
	lastSyncedAt int64,
) (*models.WorkflowEmail, error) {
	email, err := s.workflowEmailRepo.CreateWorkflowEmail(
		ctx,
		workflowID,
		config,
		historyID,
		executionState,
		lastSyncedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create workflow email: %w", err)
	}

	return email, nil
}

func (s *WorkflowEmailService) UpdateWorkflowEmail(
	ctx context.Context,
	workflowID int32,
	config models.WorkflowEmailConfig,
	historyID string,
	executionState string,
	lastSyncedAt int64,
) error {
	err := s.workflowEmailRepo.UpdateWorkflowEmail(
		ctx,
		workflowID,
		config,
		historyID,
		executionState,
		lastSyncedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to update workflow email: %w", err)
	}

	return nil
}

func (s *WorkflowEmailService) CheckEmailChanges(
	ctx context.Context,
	email *models.WorkflowEmail,
) error {
	client, err := s.InitGmailClient(ctx, email.UserID)
	if err != nil {
		return fmt.Errorf("failed to init gmail client: %w", err)
	}

	historyID, err := strconv.ParseUint(email.HistoryID, 10, 64)
	if err != nil {
		return fmt.Errorf("failed to parse history id: %w", err)
	}

	history, err := client.GetHistoryWithID(ctx, historyID, email.Config.HistoryType)
	if err != nil {
		return fmt.Errorf("failed to get history: %w", err)
	}

	if len(history.History) == 0 {
		return nil
	}

	triggerHistory := &gmail.History{}

	for _, h := range history.History {
		shouldTrigger, err := shouldTriggerWorkflow(email.Config, h, s.logger)
		if err != nil {
			return fmt.Errorf("failed to check if history should trigger workflow: %w", err)
		}

		if shouldTrigger {
			triggerHistory = h
			break
		}
	}

	if triggerHistory != nil {
		s.logger.WithFields(logrus.Fields{
			"workflow_id": email.WorkflowID,
			"history_id":  triggerHistory.Id,
		}).Info("triggering workflow")

		timeoutCtx, cancel := context.WithTimeout(ctx, 2*time.Minute)
		defer cancel()

		runID, err := s.orchestrator.OrchestrateWorkflow(timeoutCtx, email.UserID, email.WorkflowID)
		if err != nil || runID == -1 {
			s.logger.WithError(err).WithFields(logrus.Fields{
				"workflow_id": email.WorkflowID,
				"run_id":      runID,
			}).Error("failed to orchestrate workflow")

			return fmt.Errorf("failed to orchestrate workflow: %w", err)
		}

		s.logger.WithFields(logrus.Fields{
			"workflow_id": email.WorkflowID,
			"history_id":  triggerHistory.Id,
			"run_id":      runID,
		}).Info("workflow execution started successfully")
	} else {
		s.logger.WithFields(logrus.Fields{
			"workflow_id": email.WorkflowID,
		}).Info("no events matched trigger criteria")
	}

	lastSyncedAt := time.Now().UnixMilli()
	email.ExecutionState = "queued"
	nextHistoryID := strconv.FormatUint(history.HistoryId, 10)

	if err := s.workflowEmailRepo.UpdateWorkflowEmail(ctx, email.WorkflowID, email.Config, nextHistoryID, email.ExecutionState, lastSyncedAt); err != nil {
		return fmt.Errorf("failed to update workflow email: %w", err)
	}

	return nil
}

func shouldTriggerWorkflow(
	cfg models.WorkflowEmailConfig,
	h *gmail.History,
	logger logrus.FieldLogger,
) (bool, error) {
	if h == nil {
		return false, nil
	}

	switch cfg.HistoryType {
	case "messagesAdded":
		if len(h.MessagesAdded) == 0 {
			return false, nil
		}

		messages := extractMessagesAdded(h.MessagesAdded)
		if len(messages) == 0 {
			return false, nil
		}

		matches, err := matchesMessagesFilters(cfg, messages, logger)
		if err != nil {
			return false, err
		}

		return matches, nil
	case "messagesDeleted":
		if len(h.MessagesDeleted) == 0 {
			return false, nil
		}

		messages := extractMessagesDeleted(h.MessagesDeleted)
		if len(messages) == 0 {
			return false, nil
		}

		matches, err := matchesMessagesFilters(cfg, messages, logger)
		if err != nil {
			return false, err
		}

		return matches, nil
	default:
		return false, fmt.Errorf("invalid history type: %s", cfg.HistoryType)
	}
}

func extractMessagesAdded(msgs []*gmail.HistoryMessageAdded) []*gmail.Message {
	out := make([]*gmail.Message, 0, len(msgs))

	for _, m := range msgs {
		if m != nil && m.Message != nil {
			out = append(out, m.Message)
		}
	}

	return out
}

func extractMessagesDeleted(msgs []*gmail.HistoryMessageDeleted) []*gmail.Message {
	out := make([]*gmail.Message, 0, len(msgs))

	for _, m := range msgs {
		if m != nil && m.Message != nil {
			out = append(out, m.Message)
		}
	}

	return out
}

func matchesMessagesFilters(
	cfg models.WorkflowEmailConfig,
	messages []*gmail.Message,
	logger logrus.FieldLogger,
) (bool, error) {
	if len(messages) == 0 {
		return false, nil
	}

	hasKeywordFilter := len(cfg.Keywords) > 0
	hasLabelFilter := len(cfg.LabelIds) > 0

	if !hasKeywordFilter && !hasLabelFilter {
		return true, nil
	}

	for _, message := range messages {
		if message == nil {
			continue
		}

		if message.SizeEstimate > 10000 {
			logger.WithFields(logrus.Fields{
				"message_size_estimate": message.SizeEstimate,
			}).Info("message size estimate is too large")

			return false, fmt.Errorf("message size estimate is too large: %d", message.SizeEstimate)
		}

		logger.WithFields(logrus.Fields{
			"message_snippet": message.Snippet,
		}).Info("message snippet")

		keywordMatch := !hasKeywordFilter
		labelMatch := !hasLabelFilter

		// Check if all keywords match
		if hasKeywordFilter {
			searchString := strings.Builder{}
			searchString.WriteString(message.Snippet)
			searchString.WriteString(" ")

			if message.Payload != nil && message.Payload.Headers != nil {
				for _, part := range message.Payload.Headers {
					if part != nil && part.Value != "" {
						searchString.WriteString(part.Value)
						searchString.WriteString(" ")
					}
				}
			}

			searchText := strings.ToLower(searchString.String())
			keywordMatch = true

			for _, keyword := range cfg.Keywords {
				if !strings.Contains(searchText, strings.ToLower(keyword)) {
					keywordMatch = false
					break
				}
			}
		}

		// Check ANY label matches
		if hasLabelFilter {
			for _, labelId := range cfg.LabelIds {
				if slices.Contains(message.LabelIds, labelId) {
					labelMatch = true
					break
				}
			}
		}

		// Both conditions must be met
		if keywordMatch && labelMatch {
			return true, nil
		}
	}

	return false, nil
}
