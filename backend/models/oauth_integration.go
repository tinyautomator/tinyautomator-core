package models

import (
	"context"
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
}
