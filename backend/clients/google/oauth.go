package google

// import (
// 	"context"

// 	"golang.org/x/oauth2"
// )

// var googleOAuthConfig = getConfig()

// func BuildAuthURL(state string) string {
// 	return googleOAuthConfig.AuthCodeURL(state, oauth2.AccessTypeOffline)
// }
// func ExchangeCodeForToken(ctx context.Context, code string) (*oauth2.Token, error) {
// 	return googleOAuthConfig.Exchange(ctx, code)
// }
// func RefreshToken(ctx context.Context, refreshToken string) (*oauth2.Token, error) {
// 	ts := googleOAuthConfig.TokenSource(ctx, &oauth2.Token{RefreshToken: refreshToken})
// 	return ts.Token()
// }
