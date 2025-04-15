package gmail

import (
	"context"
	"fmt"

	"github.com/tinyautomator/tinyautomator-core/backend/config"

	"golang.org/x/oauth2"
	"google.golang.org/api/gmail/v1"
	"google.golang.org/api/option"
)

func SendRawEmail(ctx context.Context, token *oauth2.Token, encodedMIME string, cfg config.AppConfig) error {
	logger := cfg.GetLogger()
	tokenSource := getGmailConfig().TokenSource(ctx, token)

	gmailService, err := gmail.NewService(ctx, option.WithTokenSource(tokenSource))
	if err != nil {
		logger.Errorf("Failed to create Gmail client: %v", err)
		return fmt.Errorf("failed to create Gmail client: %w", err)
	}

	msg := &gmail.Message{
		Raw: encodedMIME,
	}

	logger.Info("Sending email...")
	response, err := gmailService.Users.Messages.Send("me", msg).Do()
	if err != nil {
		logger.Errorf("Failed to send Gmail message: %v", err)
		return fmt.Errorf("failed to send Gmail message: %w", err)
	}

	logger.Infof("Email sent! With Gmail message ID: %s and snippet... %s", response.Id, response.Snippet)
	return nil
}
