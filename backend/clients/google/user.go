package google

import (
	"context"
	"fmt"

	"golang.org/x/oauth2"
	googleOAuth2 "google.golang.org/api/oauth2/v2"
	"google.golang.org/api/option"
)

func GetUserID(
	ctx context.Context,
	token *oauth2.Token,
	oauthConfig *oauth2.Config,
) (string, error) {
	service, err := googleOAuth2.NewService(
		ctx,
		option.WithTokenSource(oauthConfig.TokenSource(ctx, token)),
	)
	if err != nil {
		return "", fmt.Errorf("unable to create google oauth2 service: %w", err)
	}

	user, err := service.Userinfo.V2.Me.Get().Do()
	if err != nil {
		return "", fmt.Errorf("failed to get google user info: %w", err)
	}

	if user.Id == "" {
		return "", fmt.Errorf("google provider userID not found in userinfo response")
	}

	return user.Id, nil
}
