package models

import (
	"context"

	"golang.org/x/oauth2"
)

type OauthIntegration struct {
	ID                   int32
	UserID               string
	Provider             string
	ProviderUserID       string
	AccessToken          string
	RefreshToken         string
	ExpiresAt            int64
	Scopes               string
	CreatedAt            int64
	UpdatedAt            int64
	AdditionalParameters map[string]any
}

type OauthIntegrationRepository interface {
	Create(ctx context.Context, oauthIntegration *OauthIntegration) (*OauthIntegration, error)
	GetByProviderAndProviderUserID(
		ctx context.Context,
		provider string,
		providerUserID string,
	) (*OauthIntegration, error)
	GetByUserID(ctx context.Context, userID string) ([]*OauthIntegration, error)
	Update(ctx context.Context, oauthIntegration *OauthIntegration) (*OauthIntegration, error)
	DeleteAllByUserID(ctx context.Context, userID string) error
}

type OauthIntegrationService interface {
	ExchangeCodeForToken(
		ctx context.Context,
		oauthConfig *oauth2.Config,
		code string,
	) (*oauth2.Token, error)
	GetToken(
		ctx context.Context,
		userID string,
		provider string,
		oauthConfig *oauth2.Config,
	) (*oauth2.Token, error)
	StoreToken(
		ctx context.Context,
		userID string,
		provider string,
		providerUserID string,
		oauthConfig *oauth2.Config,
		token *oauth2.Token,
	) error
	UpdateToken(
		ctx context.Context,
		id int32,
		oauthConfig *oauth2.Config,
		token *oauth2.Token,
	) error
}
