package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/clients/google"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
	"golang.org/x/oauth2"
)

type GoogleController struct {
	logger       logrus.FieldLogger
	oauthConfig  *oauth2.Config
	oauthService models.OauthIntegrationService
}

func NewGoogleController(
	cfg models.AppConfig,
) *GoogleController {
	return &GoogleController{
		logger:       cfg.GetLogger(),
		oauthConfig:  cfg.GetGoogleOAuthConfig(),
		oauthService: cfg.GetOauthIntegrationService(),
	}
}

func (c *GoogleController) GetCalendarList(ctx *gin.Context) {
	user, ok := ctx.Get("user")
	if !ok {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "user not found"})
		return
	}

	userID := user.(*models.User).ID

	token, err := c.oauthService.GetToken(ctx, userID, "google", c.oauthConfig)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get OAuth credentials"})
		return
	}

	client, err := google.InitCalendarClient(ctx, token, c.oauthConfig, userID)
	if err != nil {
		ctx.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Failed to initialize google calendar service"},
		)

		return
	}

	calendarList, err := client.GetCalendarList(ctx)
	if err != nil {
		ctx.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Failed to get calendar list", "error_message": err.Error()},
		)

		return
	}

	ctx.JSON(http.StatusOK, calendarList)
}

func (c *GoogleController) GetLabelList(ctx *gin.Context) {
	user, ok := ctx.Get("user")
	if !ok {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "user not found"})
		return
	}

	userID := user.(*models.User).ID

	token, err := c.oauthService.GetToken(ctx, userID, "google", c.oauthConfig)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get OAuth credentials"})
		return
	}

	client, err := google.InitGmailClient(ctx, token, c.oauthConfig)
	if err != nil {
		ctx.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Failed to initialize google gmail service"},
		)

		return
	}

	labelList, err := client.GetLabelList(ctx)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get label list"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"labels": labelList})
}
