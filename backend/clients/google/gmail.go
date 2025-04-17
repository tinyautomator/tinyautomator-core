package google

import (
	"context"
	"fmt"

	"golang.org/x/oauth2"
	"google.golang.org/api/gmail/v1"
	"google.golang.org/api/option"
)

func RefreshToken(
	ctx context.Context,
	refreshToken string,
	oauthConfig oauth2.Config,
) (*oauth2.Token, error) {
	ts := oauthConfig.TokenSource(ctx, &oauth2.Token{RefreshToken: refreshToken})
	return ts.Token()
}

func GetUserEmail(
	ctx context.Context,
	token *oauth2.Token,
	oauthConfig *oauth2.Config,
) (string, error) {
	tokenSource := oauthConfig.TokenSource(ctx, token)

	service, err := gmail.NewService(ctx, option.WithTokenSource(tokenSource))
	if err != nil {
		return "", err
	}

	profile, err := service.Users.GetProfile("me").Do()
	if err != nil {
		return "", err
	}

	return profile.EmailAddress, nil
}

func SendRawEmail(
	ctx context.Context,
	token *oauth2.Token,
	oauthConfig *oauth2.Config,
	encodedMIME string,
) error {
	tokenSource := oauthConfig.TokenSource(ctx, token)

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
