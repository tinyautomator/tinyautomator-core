package gmail

import (
	"context"

	"golang.org/x/oauth2"
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
