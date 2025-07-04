package handlers

import (
	"context"
	"encoding/base64"
	"encoding/json"
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
	Recipients []string `json:"recipients" binding:"required"`
	Subject    string   `json:"subject"    binding:"required"`
	Message    string   `json:"message"    binding:"required"`
}

func ExtractEmailConfig(input ActionNodeInput) (*EmailConfig, error) {
	bytes, err := json.Marshal(input.Config)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal config: %w", err)
	}

	var config EmailConfig

	err = json.Unmarshal(bytes, &config)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal config: %w", err)
	}

	return &config, nil
}

func encodeSimpleText(to, from, subject, body string) (string, error) {
	if to == "" || from == "" || subject == "" {
		return "", fmt.Errorf("to, from, and subject are required")
	}

	raw := fmt.Sprintf(
		"To: %s\r\nFrom: %s\r\nSubject: %s\r\nContent-Type: text/plain; charset=\"UTF-8\"\r\n\r\n%s",
		to,
		from,
		subject,
		body,
	)
	encoded := base64.RawURLEncoding.EncodeToString([]byte(raw))

	return encoded, nil
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

	client, err := google.InitGmailClient(ctx, oauthToken, h.googleOAuthConfig)
	if err != nil {
		return fmt.Errorf("failed to get user email: %w", err)
	}

	email, err := client.GetUserEmail(ctx)
	if err != nil {
		return fmt.Errorf("failed to get user email: %w", err)
	}

	encoded, err := encodeSimpleText(
		strings.Join(c.Recipients, ", "),
		email,
		c.Subject,
		c.Message,
	)
	if err != nil {
		return fmt.Errorf("failed to encode email: %w", err)
	}

	err = client.SendRawEmail(ctx, encoded)
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
