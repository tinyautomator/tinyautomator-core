package repositories

import (
	"context"
	"fmt"

	"github.com/guregu/null/v6"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/tinyautomator/tinyautomator-core/backend/db/dao"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
)

type oauthIntegrationRepo struct {
	q  *dao.Queries
	db *pgxpool.Pool
}

func NewOauthIntegrationRepository(
	q *dao.Queries,
	db *pgxpool.Pool,
) models.OauthIntegrationRepository {
	return &oauthIntegrationRepo{q, db}
}

func (r *oauthIntegrationRepo) Create(
	ctx context.Context,
	oauthIntegration *models.OauthIntegration,
) (*models.OauthIntegration, error) {
	o, err := r.q.CreateOauthIntegration(ctx, &dao.CreateOauthIntegrationParams{
		UserID:         oauthIntegration.UserID,
		Provider:       oauthIntegration.Provider,
		ProviderUserID: oauthIntegration.ProviderUserID,
		AccessToken:    oauthIntegration.AccessToken,
		RefreshToken:   null.StringFrom(oauthIntegration.RefreshToken),
		ExpiresAt:      oauthIntegration.ExpiresAt,
		Scopes:         oauthIntegration.Scopes,
		CreatedAt:      oauthIntegration.CreatedAt,
		UpdatedAt:      oauthIntegration.UpdatedAt,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create oauth integration: %w", err)
	}

	return &models.OauthIntegration{
		ID:             o.ID,
		UserID:         o.UserID,
		Provider:       o.Provider,
		ProviderUserID: o.ProviderUserID,
		AccessToken:    o.AccessToken,
		RefreshToken:   o.RefreshToken.String,
		ExpiresAt:      o.ExpiresAt,
		Scopes:         o.Scopes,
		CreatedAt:      o.CreatedAt,
		UpdatedAt:      o.UpdatedAt,
	}, nil
}

func (r *oauthIntegrationRepo) GetByProviderAndProviderUserID(
	ctx context.Context,
	provider string,
	providerUserID string,
) (*models.OauthIntegration, error) {
	o, err := r.q.GetOauthIntegrationByProviderAndProviderUserID(
		ctx,
		&dao.GetOauthIntegrationByProviderAndProviderUserIDParams{
			Provider:       provider,
			ProviderUserID: providerUserID,
		},
	)
	if err != nil {
		return nil, fmt.Errorf(
			"failed to get oauth integration by provider and provider user id: %w",
			err,
		)
	}

	return &models.OauthIntegration{
		ID:             o.ID,
		UserID:         o.UserID,
		Provider:       o.Provider,
		ProviderUserID: o.ProviderUserID,
		AccessToken:    o.AccessToken,
		RefreshToken:   o.RefreshToken.String,
		ExpiresAt:      o.ExpiresAt,
		Scopes:         o.Scopes,
		CreatedAt:      o.CreatedAt,
		UpdatedAt:      o.UpdatedAt,
	}, nil
}

func (r *oauthIntegrationRepo) GetByUserID(
	ctx context.Context,
	userID string,
) ([]*models.OauthIntegration, error) {
	oauthIntegrations, err := r.q.GetOauthIntegrationsByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get oauth integrations by user id: %w", err)
	}

	var m []*models.OauthIntegration
	for _, o := range oauthIntegrations {
		m = append(m, &models.OauthIntegration{
			ID:             o.ID,
			UserID:         o.UserID,
			Provider:       o.Provider,
			ProviderUserID: o.ProviderUserID,
			AccessToken:    o.AccessToken,
			RefreshToken:   o.RefreshToken.String,
			ExpiresAt:      o.ExpiresAt,
			Scopes:         o.Scopes,
			CreatedAt:      o.CreatedAt,
			UpdatedAt:      o.UpdatedAt,
		})
	}

	return m, nil
}

func (r *oauthIntegrationRepo) Update(
	ctx context.Context,
	oauthIntegration *models.OauthIntegration,
) (*models.OauthIntegration, error) {
	o, err := r.q.UpdateOauthIntegration(ctx, &dao.UpdateOauthIntegrationParams{
		ID:           oauthIntegration.ID,
		AccessToken:  oauthIntegration.AccessToken,
		RefreshToken: null.StringFrom(oauthIntegration.RefreshToken),
		ExpiresAt:    oauthIntegration.ExpiresAt,
		Scopes:       oauthIntegration.Scopes,
		UpdatedAt:    oauthIntegration.UpdatedAt,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to update oauth integration: %w", err)
	}

	return &models.OauthIntegration{
		ID:             o.ID,
		UserID:         o.UserID,
		Provider:       o.Provider,
		ProviderUserID: o.ProviderUserID,
		AccessToken:    o.AccessToken,
		RefreshToken:   o.RefreshToken.String,
		ExpiresAt:      o.ExpiresAt,
		Scopes:         o.Scopes,
		CreatedAt:      o.CreatedAt,
		UpdatedAt:      o.UpdatedAt,
	}, nil
}

func (r *oauthIntegrationRepo) DeleteAllByUserID(ctx context.Context, userID string) error {
	if err := r.q.DeleteOauthIntegrationByUserID(ctx, userID); err != nil {
		return fmt.Errorf("failed to delete oauth integration by user id: %w", err)
	}

	return nil
}

var _ models.OauthIntegrationRepository = &oauthIntegrationRepo{}
