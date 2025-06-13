package google

import (
	"context"
	"fmt"

	"golang.org/x/oauth2"
	"google.golang.org/api/gmail/v1"
	"google.golang.org/api/option"
)

type GmailClient struct {
	service *gmail.Service
}

type GmailToken struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	Expiry       string `json:"expiry"`
}

func InitGmailClient(
	ctx context.Context,
	token *oauth2.Token,
	oauthConfig *oauth2.Config,
) (*GmailClient, error) {
	tokenSource := oauthConfig.TokenSource(ctx, token)

	service, err := gmail.NewService(ctx, option.WithTokenSource(tokenSource))
	if err != nil {
		return nil, fmt.Errorf("unable to init gmail service: %w", err)
	}

	return &GmailClient{service: service}, nil
}

func (c *GmailClient) GetUserEmail(
	ctx context.Context,
) (string, error) {
	profile, err := c.service.Users.GetProfile("me").Do()
	if err != nil {
		return "", fmt.Errorf("unable to get the user's profile: %w", err)
	}

	return profile.EmailAddress, nil
}

func (c *GmailClient) SendRawEmail(
	ctx context.Context,
	encodedMIME string,
) error {
	msg := &gmail.Message{
		Raw: encodedMIME,
	}

	_, err := c.service.Users.Messages.Send("me", msg).Do()
	if err != nil {
		return fmt.Errorf("failed to send Gmail message: %w", err)
	}

	return nil
}
