-- name: CreateOauthIntegration :one
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
RETURNING *;

-- name: GetOauthIntegrationByID :one
SELECT * FROM oauth_integration
WHERE id = $1
LIMIT 1;

-- name: GetOauthIntegrationByProviderAndProviderUserID :one
SELECT * FROM oauth_integration
WHERE provider = $1 AND provider_user_id = $2
LIMIT 1;

-- name: GetOauthIntegrationsByUserID :many
SELECT * FROM oauth_integration
WHERE user_id = $1
ORDER BY created_at DESC;

-- name: UpdateOauthIntegration :one
UPDATE oauth_integration
SET
    access_token = $2,
    refresh_token = $3,
    expires_at = $4,
    scopes = $5,
    updated_at = $6,
    additional_parameters = $7
WHERE id = $1
RETURNING *;
