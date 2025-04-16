package gmail

import (
	"context"

	"golang.org/x/oauth2"
	"google.golang.org/api/gmail/v1"
	"google.golang.org/api/option"
)

func BuildAuthURL(state string) string {
	return getGmailConfig().AuthCodeURL(state, oauth2.AccessTypeOffline)
}
func ExchangeCodeForToken(ctx context.Context, code string) (*oauth2.Token, error) {
	return getGmailConfig().Exchange(ctx, code)
}
func RefreshToken(ctx context.Context, refreshToken string) (*oauth2.Token, error) {
	ts := getGmailConfig().TokenSource(ctx, &oauth2.Token{RefreshToken: refreshToken})
	return ts.Token()
}

func GetUserEmail(ctx context.Context, token *oauth2.Token) (string, error) {
	tokenSource := getGmailConfig().TokenSource(ctx, token)

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
