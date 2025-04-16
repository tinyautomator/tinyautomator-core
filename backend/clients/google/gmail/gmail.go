package gmail

import (
	"golang.org/x/oauth2"
	g "golang.org/x/oauth2/google"
)

var gmailOAuthConfig *oauth2.Config

func GmailClientInit(clientID, clientSecret, redirectURL string, scopes []string) {
	gmailOAuthConfig = &oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		RedirectURL:  redirectURL,
		Scopes:       scopes,
		Endpoint:     g.Endpoint,
	}
}

func getGmailConfig() *oauth2.Config {
	return gmailOAuthConfig
}
