package controllers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/clients/google"
	"github.com/tinyautomator/tinyautomator-core/backend/clients/redis"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
	"golang.org/x/oauth2"
)

type GoogleAuthController interface {
	GetGoogleAuthURL(ctx *gin.Context)
	HandleCallBack(ctx *gin.Context)
}

type googleAuthController struct {
	logger            logrus.FieldLogger
	googleOAuthConfig *oauth2.Config
	redisClient       redis.RedisClient
}

func NewGoogleAuthController(cfg models.AppConfig) GoogleAuthController {
	return &googleAuthController{
		logger:            cfg.GetLogger(),
		googleOAuthConfig: cfg.GetGoogleOAuthConfig(),
		redisClient:       cfg.GetRedisClient(),
	}
}

func (c *googleAuthController) GetGoogleAuthURL(ctx *gin.Context) {
	user, ok := ctx.Get("user")
	if !ok {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "user not found"})
		return
	}

	userID := user.(*models.User).ID
	c.logger.WithField("userID", userID).Info("Getting Google Auth URL")

	// TODO : Introduce a random state for each request for security purposes
	authURL := c.googleOAuthConfig.AuthCodeURL(
		"devtest",
		oauth2.AccessTypeOffline,
		oauth2.SetAuthURLParam("prompt", "consent"),
	)
	ctx.JSON(http.StatusOK, gin.H{
		"url": authURL,
	})
}

func (c *googleAuthController) HandleCallBack(ctx *gin.Context) {
	code := ctx.Query("code")

	if code == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Missing code"})
		return
	}

	token, err := c.googleOAuthConfig.Exchange(ctx, code)
	if err != nil {
		ctx.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Token exchange failed", "details": err.Error()},
		)

		return
	}

	tokenData := google.GmailToken{
		AccessToken:  token.AccessToken,
		RefreshToken: token.RefreshToken,
		Expiry:       token.Expiry.Format(time.RFC3339),
	}

	// TODO: Remove this once we have a proper way to store the token
	if err := c.redisClient.SetGmailToken(ctx, tokenData); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save token"})
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
