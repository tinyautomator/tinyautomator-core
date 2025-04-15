package gmail

import (
	"github.com/tinyautomator/tinyautomator-core/backend/config"
	"golang.org/x/oauth2"
	g "golang.org/x/oauth2/google"
)

var gmailOAuthConfig *oauth2.Config

func GmailClientInit(cfg config.EnvironmentVariables) {
	gmailOAuthConfig = &oauth2.Config{
		ClientID:     cfg.GmailClientID,
		ClientSecret: cfg.GmailClientSecret,
		RedirectURL:  cfg.GmailRedirectURL,
		Scopes:       cfg.GmailScopes,
		Endpoint:     g.Endpoint,
	}
}

func getGmailConfig() *oauth2.Config {
	return gmailOAuthConfig
}
