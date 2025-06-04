package handlers

import (
	"context"
	"fmt"
	"net/mail"
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

type EmailConfig struct {
	Recipients []string
	Subject    string
	Message    string
}

func ExtractEmailConfig(input ActionNodeInput) (*EmailConfig, error) {
	recipients, ok := input.Config["recipients"].([]string)
	if !ok {
		return nil, fmt.Errorf("recipients must be an array of strings")
	}

	subject, ok := input.Config["subject"].(string)
	if !ok {
		return nil, fmt.Errorf("subject must be a string")
	}

	message, ok := input.Config["message"].(string)
	if !ok {
		return nil, fmt.Errorf("message must be a string")
	}

	return &EmailConfig{
		Recipients: recipients,
		Subject:    subject,
		Message:    message,
	}, nil
}

func (h *SendEmailHandler) Execute(
	ctx context.Context,
	userID string,
	input ActionNodeInput,
) error {
	c, err := ExtractEmailConfig(input)
	if err != nil {
		return fmt.Errorf("invalid email config: %w", err)
	}

	h.logger.WithFields(logrus.Fields{
		"recipients": c.Recipients,
		"subject":    c.Subject,
		"body":       c.Message,
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
		strings.Join(c.Recipients, ", "),
		email,
		c.Subject,
		c.Message,
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
	c, err := ExtractEmailConfig(config)
	if err != nil {
		return err
	}

	if len(c.Recipients) == 0 {
		return fmt.Errorf("recipients must be an array of at least one email address")
	}

	for _, recipient := range c.Recipients {
		if _, err := mail.ParseAddress(recipient); err != nil {
			return fmt.Errorf("invalid email address: %s", recipient)
		}
	}

	if len(c.Subject) > 256 {
		return fmt.Errorf("subject must be less than 256 characters")
	}

	if len(c.Message) > 10000 {
		return fmt.Errorf("message must be less than 10000 characters")
	}

	return nil
}

var _ ActionHandler = &SendEmailHandler{}
