// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.29.0
// source: oauth_integration.sql

package dao

import (
	"context"

	null "github.com/guregu/null/v6"
)

const createOauthIntegration = `-- name: CreateOauthIntegration :one
INSERT INTO oauth_integration (
    user_id,
    provider,
    provider_user_id,
    access_token,
    refresh_token,
    expires_at,
    scopes,
    created_at,
    updated_at,
    additional_parameters
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
RETURNING id, user_id, provider, provider_user_id, access_token, refresh_token, expires_at, scopes, created_at, updated_at, additional_parameters
`

type CreateOauthIntegrationParams struct {
	UserID               string      `json:"user_id"`
	Provider             string      `json:"provider"`
	ProviderUserID       string      `json:"provider_user_id"`
	AccessToken          string      `json:"access_token"`
	RefreshToken         null.String `json:"refresh_token"`
	ExpiresAt            int64       `json:"expires_at"`
	Scopes               string      `json:"scopes"`
	CreatedAt            int64       `json:"created_at"`
	UpdatedAt            int64       `json:"updated_at"`
	AdditionalParameters []byte      `json:"additional_parameters"`
}

// CreateOauthIntegration
//
//	INSERT INTO oauth_integration (
//	    user_id,
//	    provider,
//	    provider_user_id,
//	    access_token,
//	    refresh_token,
//	    expires_at,
//	    scopes,
//	    created_at,
//	    updated_at,
//	    additional_parameters
//	) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
//	RETURNING id, user_id, provider, provider_user_id, access_token, refresh_token, expires_at, scopes, created_at, updated_at, additional_parameters
func (q *Queries) CreateOauthIntegration(ctx context.Context, arg *CreateOauthIntegrationParams) (*OauthIntegration, error) {
	row := q.db.QueryRow(ctx, createOauthIntegration,
		arg.UserID,
		arg.Provider,
		arg.ProviderUserID,
		arg.AccessToken,
		arg.RefreshToken,
		arg.ExpiresAt,
		arg.Scopes,
		arg.CreatedAt,
		arg.UpdatedAt,
		arg.AdditionalParameters,
	)
	var i OauthIntegration
	err := row.Scan(
		&i.ID,
		&i.UserID,
		&i.Provider,
		&i.ProviderUserID,
		&i.AccessToken,
		&i.RefreshToken,
		&i.ExpiresAt,
		&i.Scopes,
		&i.CreatedAt,
		&i.UpdatedAt,
		&i.AdditionalParameters,
	)
	return &i, err
}

const deleteOauthIntegrationByUserID = `-- name: DeleteOauthIntegrationByUserID :exec
DELETE FROM oauth_integration
WHERE user_id = $1
`

// DeleteOauthIntegrationByUserID
//
//	DELETE FROM oauth_integration
//	WHERE user_id = $1
func (q *Queries) DeleteOauthIntegrationByUserID(ctx context.Context, userID string) error {
	_, err := q.db.Exec(ctx, deleteOauthIntegrationByUserID, userID)
	return err
}

const getOauthIntegrationByID = `-- name: GetOauthIntegrationByID :one
SELECT id, user_id, provider, provider_user_id, access_token, refresh_token, expires_at, scopes, created_at, updated_at, additional_parameters FROM oauth_integration
WHERE id = $1
LIMIT 1
`

// GetOauthIntegrationByID
//
//	SELECT id, user_id, provider, provider_user_id, access_token, refresh_token, expires_at, scopes, created_at, updated_at, additional_parameters FROM oauth_integration
//	WHERE id = $1
//	LIMIT 1
func (q *Queries) GetOauthIntegrationByID(ctx context.Context, id int32) (*OauthIntegration, error) {
	row := q.db.QueryRow(ctx, getOauthIntegrationByID, id)
	var i OauthIntegration
	err := row.Scan(
		&i.ID,
		&i.UserID,
		&i.Provider,
		&i.ProviderUserID,
		&i.AccessToken,
		&i.RefreshToken,
		&i.ExpiresAt,
		&i.Scopes,
		&i.CreatedAt,
		&i.UpdatedAt,
		&i.AdditionalParameters,
	)
	return &i, err
}

const getOauthIntegrationByProviderAndProviderUserID = `-- name: GetOauthIntegrationByProviderAndProviderUserID :one
SELECT id, user_id, provider, provider_user_id, access_token, refresh_token, expires_at, scopes, created_at, updated_at, additional_parameters FROM oauth_integration
WHERE provider = $1 AND provider_user_id = $2
LIMIT 1
`

type GetOauthIntegrationByProviderAndProviderUserIDParams struct {
	Provider       string `json:"provider"`
	ProviderUserID string `json:"provider_user_id"`
}

// GetOauthIntegrationByProviderAndProviderUserID
//
//	SELECT id, user_id, provider, provider_user_id, access_token, refresh_token, expires_at, scopes, created_at, updated_at, additional_parameters FROM oauth_integration
//	WHERE provider = $1 AND provider_user_id = $2
//	LIMIT 1
func (q *Queries) GetOauthIntegrationByProviderAndProviderUserID(ctx context.Context, arg *GetOauthIntegrationByProviderAndProviderUserIDParams) (*OauthIntegration, error) {
	row := q.db.QueryRow(ctx, getOauthIntegrationByProviderAndProviderUserID, arg.Provider, arg.ProviderUserID)
	var i OauthIntegration
	err := row.Scan(
		&i.ID,
		&i.UserID,
		&i.Provider,
		&i.ProviderUserID,
		&i.AccessToken,
		&i.RefreshToken,
		&i.ExpiresAt,
		&i.Scopes,
		&i.CreatedAt,
		&i.UpdatedAt,
		&i.AdditionalParameters,
	)
	return &i, err
}

const getOauthIntegrationsByUserID = `-- name: GetOauthIntegrationsByUserID :many
SELECT id, user_id, provider, provider_user_id, access_token, refresh_token, expires_at, scopes, created_at, updated_at, additional_parameters FROM oauth_integration
WHERE user_id = $1
ORDER BY created_at DESC
`

// GetOauthIntegrationsByUserID
//
//	SELECT id, user_id, provider, provider_user_id, access_token, refresh_token, expires_at, scopes, created_at, updated_at, additional_parameters FROM oauth_integration
//	WHERE user_id = $1
//	ORDER BY created_at DESC
func (q *Queries) GetOauthIntegrationsByUserID(ctx context.Context, userID string) ([]*OauthIntegration, error) {
	rows, err := q.db.Query(ctx, getOauthIntegrationsByUserID, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []*OauthIntegration
	for rows.Next() {
		var i OauthIntegration
		if err := rows.Scan(
			&i.ID,
			&i.UserID,
			&i.Provider,
			&i.ProviderUserID,
			&i.AccessToken,
			&i.RefreshToken,
			&i.ExpiresAt,
			&i.Scopes,
			&i.CreatedAt,
			&i.UpdatedAt,
			&i.AdditionalParameters,
		); err != nil {
			return nil, err
		}
		items = append(items, &i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const updateOauthIntegration = `-- name: UpdateOauthIntegration :one
UPDATE oauth_integration
SET
    access_token = $2,
    refresh_token = $3,
    expires_at = $4,
    scopes = $5,
    updated_at = $6,
    additional_parameters = $7
WHERE id = $1
RETURNING id, user_id, provider, provider_user_id, access_token, refresh_token, expires_at, scopes, created_at, updated_at, additional_parameters
`

type UpdateOauthIntegrationParams struct {
	ID                   int32       `json:"id"`
	AccessToken          string      `json:"access_token"`
	RefreshToken         null.String `json:"refresh_token"`
	ExpiresAt            int64       `json:"expires_at"`
	Scopes               string      `json:"scopes"`
	UpdatedAt            int64       `json:"updated_at"`
	AdditionalParameters []byte      `json:"additional_parameters"`
}

// UpdateOauthIntegration
//
//	UPDATE oauth_integration
//	SET
//	    access_token = $2,
//	    refresh_token = $3,
//	    expires_at = $4,
//	    scopes = $5,
//	    updated_at = $6,
//	    additional_parameters = $7
//	WHERE id = $1
//	RETURNING id, user_id, provider, provider_user_id, access_token, refresh_token, expires_at, scopes, created_at, updated_at, additional_parameters
func (q *Queries) UpdateOauthIntegration(ctx context.Context, arg *UpdateOauthIntegrationParams) (*OauthIntegration, error) {
	row := q.db.QueryRow(ctx, updateOauthIntegration,
		arg.ID,
		arg.AccessToken,
		arg.RefreshToken,
		arg.ExpiresAt,
		arg.Scopes,
		arg.UpdatedAt,
		arg.AdditionalParameters,
	)
	var i OauthIntegration
	err := row.Scan(
		&i.ID,
		&i.UserID,
		&i.Provider,
		&i.ProviderUserID,
		&i.AccessToken,
		&i.RefreshToken,
		&i.ExpiresAt,
		&i.Scopes,
		&i.CreatedAt,
		&i.UpdatedAt,
		&i.AdditionalParameters,
	)
	return &i, err
}
