package services

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
	"golang.org/x/oauth2"
)

type oauthIntegrationService struct {
	logger logrus.FieldLogger

	oauthIntegrationRepo models.OauthIntegrationRepository
}

func NewOauthIntegrationService(cfg models.AppConfig) models.OauthIntegrationService {
	return &oauthIntegrationService{
		logger:               cfg.GetLogger(),
		oauthIntegrationRepo: cfg.GetOauthIntegrationRepository(),
	}
}

func (s *oauthIntegrationService) ExchangeCodeForToken(
	ctx context.Context,
	oauthConfig *oauth2.Config,
	code string,
) (*oauth2.Token, error) {
	token, err := oauthConfig.Exchange(ctx, code)
	if err != nil {
		return nil, fmt.Errorf("failed to exchange code for token: %w", err)
	}

	return token, nil
}

func (s *oauthIntegrationService) GetToken(
	ctx context.Context,
	userID string,
	provider string,
	oauthConfig *oauth2.Config,
) (*oauth2.Token, error) {
	oauthIntegration, err := s.oauthIntegrationRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get oauth integration: %w", err)
	}

	for _, oauthIntegration := range oauthIntegration {
		if oauthIntegration.Provider == provider {
			token, err := oauthConfig.TokenSource(ctx, &oauth2.Token{
				AccessToken:  oauthIntegration.AccessToken,
				RefreshToken: oauthIntegration.RefreshToken,
				Expiry:       time.UnixMilli(oauthIntegration.ExpiresAt),
			}).Token()
			if err != nil {
				return nil, fmt.Errorf("failed to get token: %w", err)
			}

			return token, nil
		}
	}

	return nil, fmt.Errorf("no oauth integration found for provider: %s", provider)
}

func (s *oauthIntegrationService) StoreToken(
	ctx context.Context,
	userID string,
	provider string,
	oauthConfig *oauth2.Config,
	token *oauth2.Token,
) error {
	if _, err := s.oauthIntegrationRepo.Create(ctx, &models.OauthIntegration{
		UserID:         userID,
		Provider:       provider,
		ProviderUserID: oauthConfig.ClientID,
		AccessToken:    token.AccessToken,
		RefreshToken:   token.RefreshToken,
		ExpiresAt:      token.Expiry.UnixMilli(),
		Scopes:         strings.Join(oauthConfig.Scopes, ","),
		CreatedAt:      time.Now().UnixMilli(),
		UpdatedAt:      time.Now().UnixMilli(),
	}); err != nil {
		return fmt.Errorf("failed to create oauth integration: %w", err)
	}

	return nil
}
