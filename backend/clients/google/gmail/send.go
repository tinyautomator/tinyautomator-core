package gmail

import (
	"context"
	"fmt"

	"golang.org/x/oauth2"
	"google.golang.org/api/gmail/v1"
	"google.golang.org/api/option"
)

func SendRawEmail(ctx context.Context, token *oauth2.Token, encodedMIME string) error {

	tokenSource := getGmailConfig().TokenSource(ctx, token)

	gmailService, err := gmail.NewService(ctx, option.WithTokenSource(tokenSource))
	if err != nil {
		return fmt.Errorf("failed to create Gmail client: %w", err)
	}

	msg := &gmail.Message{
		Raw: encodedMIME,
	}

	_, err = gmailService.Users.Messages.Send("me", msg).Do()
	if err != nil {
		return fmt.Errorf("failed to send Gmail message: %w", err)
	}

	return nil
}
