package handlers

import (
	"context"
	"fmt"
	"strings"

	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/clients/google"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
	"golang.org/x/oauth2"
)

type SendEmailHandler struct {
	logger              logrus.FieldLogger
	googleOAuthConfig   *oauth2.Config
	oauthIntegrationSvc models.OauthIntegrationService
}

func NewSendEmailHandler(cfg models.AppConfig) ActionHandler {
	return &SendEmailHandler{
		logger:              cfg.GetLogger(),
		googleOAuthConfig:   cfg.GetGoogleOAuthConfig(),
		oauthIntegrationSvc: cfg.GetOauthIntegrationService(),
	}
}

func (h *SendEmailHandler) Execute(
	ctx context.Context,
	userID string,
	input ActionNodeInput,
) error {
	recipients := input.Config["recipients"].([]interface{})
	recipientEmails := make([]string, len(recipients))

	for i, r := range recipients {
		recipientEmails[i] = r.(string)
	}

	subject := input.Config["subject"].(string)
	body := input.Config["message"].(string)

	h.logger.WithFields(logrus.Fields{
		"recipients": recipientEmails,
		"subject":    subject,
		"body":       body,
	}).Info("sending email")

	oauthToken, err := h.oauthIntegrationSvc.GetToken(ctx, userID, "google", h.googleOAuthConfig)
	if err != nil {
		return fmt.Errorf("failed to get oauth token: %w", err)
	}

	email, err := google.GetUserEmail(ctx, oauthToken, h.googleOAuthConfig)
	if err != nil {
		return fmt.Errorf("failed to get user email: %w", err)
	}

	encoded, err := google.EncodeSimpleText(
		strings.Join(recipientEmails, ", "),
		email,
		subject,
		body,
	)
	if err != nil {
		return fmt.Errorf("failed to encode email: %w", err)
	}

	err = google.SendRawEmail(ctx, oauthToken, h.googleOAuthConfig, encoded)
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}

	return nil
}

func (h *SendEmailHandler) Validate(config ActionNodeInput) error {
	return nil
}

var _ ActionHandler = &SendEmailHandler{}
