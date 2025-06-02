package services

import (
	"context"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"io"
	"strings"
	"time"

	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
	"golang.org/x/oauth2"
)

type oauthIntegrationService struct {
	logger             logrus.FieldLogger
	tokenEncryptionKey string

	oauthIntegrationRepo models.OauthIntegrationRepository
}

func NewOauthIntegrationService(cfg models.AppConfig) models.OauthIntegrationService {
	return &oauthIntegrationService{
		logger:               cfg.GetLogger(),
		oauthIntegrationRepo: cfg.GetOauthIntegrationRepository(),
		tokenEncryptionKey:   cfg.GetEnvVars().TokenEncryptionKey,
	}
}

func (s *oauthIntegrationService) encrypt(plaintext string) (string, error) {
	if plaintext == "" {
		return "", nil
	}

	decodedTokenEncryptionKey, err := hex.DecodeString(s.tokenEncryptionKey)
	if err != nil {
		return "", fmt.Errorf("failed to decode token encryption key: %w", err)
	}

	block, err := aes.NewCipher(decodedTokenEncryptionKey)
	if err != nil {
		return "", fmt.Errorf("failed to create AES cipher: %w", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", fmt.Errorf("failed to create GCM cipher mode: %w", err)
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		return "", fmt.Errorf("failed to generate nonce: %w", err)
	}

	ciphertextWithNonce := gcm.Seal(nonce, nonce, []byte(plaintext), nil)

	return base64.StdEncoding.EncodeToString(ciphertextWithNonce), nil
}

func (s *oauthIntegrationService) decrypt(base64CiphertextWithNonce string) (string, error) {
	if base64CiphertextWithNonce == "" {
		return "", nil
	}

	ciphertextWithNonce, err := base64.StdEncoding.DecodeString(base64CiphertextWithNonce)
	if err != nil {
		return "", fmt.Errorf("failed to base64 decode: %w", err)
	}

	decodedTokenEncryptionKey, err := hex.DecodeString(s.tokenEncryptionKey)
	if err != nil {
		return "", fmt.Errorf("failed to decode token encryption key: %w", err)
	}

	block, err := aes.NewCipher(decodedTokenEncryptionKey)
	if err != nil {
		return "", fmt.Errorf("failed to create AES cipher for decryption: %w", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", fmt.Errorf("failed to create GCM cipher mode for decryption: %w", err)
	}

	nonceSize := gcm.NonceSize()
	if len(ciphertextWithNonce) < nonceSize {
		return "", fmt.Errorf("ciphertext is too short to contain nonce")
	}

	nonce, ciphertext := ciphertextWithNonce[:nonceSize], ciphertextWithNonce[nonceSize:]

	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", fmt.Errorf("failed to decrypt (authentication failed): %w", err)
	}

	return string(plaintext), nil
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
	o, err := s.oauthIntegrationRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get oauth integration: %w", err)
	}

	for _, record := range o {
		if record.Provider == provider {
			decryptedAccessToken, err := s.decrypt(record.AccessToken)
			if err != nil {
				return nil, fmt.Errorf(
					"failed to decrypt access token for provider %s: %w",
					provider,
					err,
				)
			}

			var decryptedRefreshToken string
			if record.RefreshToken != "" {
				decryptedRefreshToken, err = s.decrypt(record.RefreshToken)
				if err != nil {
					return nil, fmt.Errorf(
						"failed to decrypt refresh token for provider %s: %w",
						provider,
						err,
					)
				}
			}

			refreshedToken, err := oauthConfig.TokenSource(ctx, &oauth2.Token{
				AccessToken:  decryptedAccessToken,
				RefreshToken: decryptedRefreshToken,
				Expiry:       time.UnixMilli(record.ExpiresAt),
			}).Token()
			if err != nil {
				return nil, fmt.Errorf("failed to get token: %w", err)
			}

			if refreshedToken.AccessToken != decryptedAccessToken ||
				(refreshedToken.RefreshToken != "" && refreshedToken.RefreshToken != decryptedRefreshToken) {
				if err := s.UpdateToken(ctx, record.ID, oauthConfig, refreshedToken); err != nil {
					return nil, fmt.Errorf("failed to update token: %w", err)
				}
			}

			return refreshedToken, nil
		}
	}

	return nil, fmt.Errorf("no oauth integration found for provider: %s", provider)
}

func (s *oauthIntegrationService) StoreToken(
	ctx context.Context,
	userID string,
	provider string,
	providerUserID string,
	oauthConfig *oauth2.Config,
	token *oauth2.Token,
) error {
	encryptedAccessToken, err := s.encrypt(token.AccessToken)
	if err != nil {
		return fmt.Errorf("failed to encrypt access token for user %s: %w", userID, err)
	}

	var encryptedRefreshToken string
	if token.RefreshToken != "" {
		encryptedRefreshToken, err = s.encrypt(token.RefreshToken)
		if err != nil {
			return fmt.Errorf("failed to encrypt refresh token for user %s: %w", userID, err)
		}
	}

	if _, err := s.oauthIntegrationRepo.Create(ctx, &models.OauthIntegration{
		UserID:         userID,
		Provider:       provider,
		ProviderUserID: providerUserID,
		AccessToken:    encryptedAccessToken,
		RefreshToken:   encryptedRefreshToken,
		ExpiresAt:      token.Expiry.UnixMilli(),
		Scopes:         strings.Join(oauthConfig.Scopes, ","),
		CreatedAt:      time.Now().UnixMilli(),
		UpdatedAt:      time.Now().UnixMilli(),
	}); err != nil {
		return fmt.Errorf("failed to create oauth integration: %w", err)
	}

	return nil
}

func (s *oauthIntegrationService) UpdateToken(
	ctx context.Context,
	id int32,
	oauthConfig *oauth2.Config,
	token *oauth2.Token,
) error {
	encryptedAccessToken, err := s.encrypt(token.AccessToken)
	if err != nil {
		return fmt.Errorf("failed to encrypt access token for oauth integration %d: %w", id, err)
	}

	var encryptedRefreshToken string
	if token.RefreshToken != "" {
		encryptedRefreshToken, err = s.encrypt(token.RefreshToken)
		if err != nil {
			return fmt.Errorf(
				"failed to encrypt refresh token for oauth integration %d: %w",
				id,
				err,
			)
		}
	}

	if _, err := s.oauthIntegrationRepo.Update(ctx, &models.OauthIntegration{
		ID:           id,
		AccessToken:  encryptedAccessToken,
		RefreshToken: encryptedRefreshToken,
		ExpiresAt:    token.Expiry.UnixMilli(),
		Scopes:       strings.Join(oauthConfig.Scopes, ","),
		UpdatedAt:    time.Now().UnixMilli(),
	}); err != nil {
		return fmt.Errorf("failed to update oauth integration: %w", err)
	}

	return nil
}
