package handlers

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/clients/google"
	"github.com/tinyautomator/tinyautomator-core/backend/clients/redis"
	"golang.org/x/oauth2"
)

type SendEmailHandler struct {
	logger            logrus.FieldLogger
	redisClient       redis.RedisClient
	googleOAuthConfig *oauth2.Config
}

func NewSendEmailHandler(
	logger logrus.FieldLogger,
	redisClient redis.RedisClient,
	googleOAuthConfig *oauth2.Config,
) ActionHandler {
	return &SendEmailHandler{
		logger:            logger,
		redisClient:       redisClient,
		googleOAuthConfig: googleOAuthConfig,
	}
}

func (h *SendEmailHandler) Execute(ctx context.Context, input ActionNodeInput) error {
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

	token, err := h.redisClient.GetGmailToken(ctx)
	if err != nil {
		return fmt.Errorf("failed to get gmail token: %w", err)
	}

	expiryTime, err := time.Parse(time.RFC3339, token.Expiry)
	if err != nil {
		return fmt.Errorf("failed to parse expiry time: %w", err)
	}

	oauthToken := &oauth2.Token{
		AccessToken:  token.AccessToken,
		RefreshToken: token.RefreshToken,
		Expiry:       expiryTime,
		TokenType:    "Bearer",
	}

	if expiryTime.Before(time.Now()) {
		oauthToken, err = h.googleOAuthConfig.TokenSource(ctx, oauthToken).Token()
		if err != nil {
			return fmt.Errorf("failed to refresh gmail token: %w", err)
		}

		if err := h.redisClient.SetGmailToken(ctx, google.GmailToken{
			AccessToken:  oauthToken.AccessToken,
			RefreshToken: oauthToken.RefreshToken,
			Expiry:       oauthToken.Expiry.Format(time.RFC3339),
		}); err != nil {
			return fmt.Errorf("failed to set gmail token: %w", err)
		}
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
