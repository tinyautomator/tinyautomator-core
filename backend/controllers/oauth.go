package controllers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/clients/clerk"
	"github.com/tinyautomator/tinyautomator-core/backend/clients/google"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
	"golang.org/x/oauth2"
)

type GoogleAuthController interface {
	GetGoogleAuthURL(ctx *gin.Context)
	HandleCallBack(ctx *gin.Context)
}

type googleAuthController struct {
	logger              logrus.FieldLogger
	googleOAuthConfig   *oauth2.Config
	jwtSecret           []byte
	oauthIntegrationSvc models.OauthIntegrationService
}

func NewGoogleAuthController(cfg models.AppConfig) GoogleAuthController {
	return &googleAuthController{
		logger:              cfg.GetLogger(),
		googleOAuthConfig:   cfg.GetGoogleOAuthConfig(),
		jwtSecret:           []byte(cfg.GetEnvVars().JwtSecret),
		oauthIntegrationSvc: cfg.GetOauthIntegrationService(),
	}
}

func (c *googleAuthController) createSecureState(userID string) (string, error) {
	claims := jwt.RegisteredClaims{
		Subject:   userID,
		IssuedAt:  jwt.NewNumericDate(time.Now()),
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(10 * time.Minute)),
		Audience:  jwt.ClaimStrings{"google_oauth"},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	signedToken, err := token.SignedString(c.jwtSecret)
	if err != nil {
		return "", fmt.Errorf("failed to sign token: %w", err)
	}

	return signedToken, nil
}

func (c *googleAuthController) parseSecureState(state string) (string, error) {
	claims := &jwt.RegisteredClaims{}

	token, err := jwt.ParseWithClaims(state, claims, func(token *jwt.Token) (any, error) {
		return c.jwtSecret, nil
	},
		jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}),
		jwt.WithAudience("google_oauth"),
	)
	if err != nil {
		return "", fmt.Errorf("invalid token: %w", err)
	}

	if !token.Valid {
		return "", fmt.Errorf("invalid token")
	}

	return claims.Subject, nil
}

func (c *googleAuthController) GetGoogleAuthURL(ctx *gin.Context) {
	user, ok := ctx.Get("user")
	if !ok {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "user not found"})
		return
	}

	userID := user.(*models.User).ID

	state, err := c.createSecureState(userID)
	if err != nil {
		c.logger.WithError(err).Error("Failed to create secure state for google oauth")
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get google auth url"})

		return
	}

	authURL := c.googleOAuthConfig.AuthCodeURL(
		state,
		oauth2.AccessTypeOffline,
		oauth2.SetAuthURLParam("prompt", "consent"),
	)
	ctx.JSON(http.StatusOK, gin.H{
		"url": authURL,
	})
}

func (c *googleAuthController) HandleCallBack(ctx *gin.Context) {
	code := ctx.Query("code")
	state := ctx.Query("state")

	if code == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Missing code"})
		return
	}

	if state == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Missing state parameter"})
		return
	}

	userID, err := c.parseSecureState(state)
	if err != nil {
		c.logger.WithError(err).Error("Failed to parse secure state for google oauth")
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or expired state parameter"})

		return
	}

	if _, err := clerk.GetUser(ctx, userID); err != nil {
		c.logger.WithError(err).Error("Failed to get user from clerk")
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Unable to get user in oauth callback"})

		return
	}

	token, err := c.googleOAuthConfig.Exchange(ctx, code)
	if err != nil {
		c.logger.WithError(err).Error("Failed to exchange code for token in oauth callback")
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Token exchange failed"})

		return
	}

	googleUserID, err := google.GetUserID(ctx, token, c.googleOAuthConfig)
	if err != nil {
		c.logger.WithError(err).Error("Failed to get google user ID")
		ctx.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Failed to get google user ID in oauth callback"},
		)

		return
	}

	if err := c.oauthIntegrationSvc.StoreToken(ctx, userID, "google", googleUserID, c.googleOAuthConfig, token); err != nil {
		c.logger.WithError(err).Error("Failed to create oauth integration")
		ctx.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Failed to create oauth integration in oauth callback"},
		)

		return
	}

	ctx.Header("Content-Type", "text/html")
	ctx.String(http.StatusOK, `
    	<html>
    	    <body>
    	        <script>
    	            window.close();
    	        </script>
    	    </body>
    	</html>
	`)
}

var _ GoogleAuthController = (*googleAuthController)(nil)
