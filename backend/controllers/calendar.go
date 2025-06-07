package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/clients/google"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
	"golang.org/x/oauth2"
	"google.golang.org/api/calendar/v3"
	"google.golang.org/api/option"
)

type CalendarController struct {
	logger       logrus.FieldLogger
	oauthConfig  *oauth2.Config
	oauthService models.OauthIntegrationService
}

func NewCalendarController(
	cfg models.AppConfig,
) *CalendarController {
	return &CalendarController{
		logger:       cfg.GetLogger(),
		oauthConfig:  cfg.GetGoogleOAuthConfig(),
		oauthService: cfg.GetOauthIntegrationService(),
	}
}

func (c *CalendarController) GetCalendarList(ctx *gin.Context) {
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

	tokenSource := c.oauthConfig.TokenSource(ctx, token)

	calendarService, err := calendar.NewService(ctx, option.WithTokenSource(tokenSource))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get calendar service"})
		return
	}

	calendarList, err := google.GetCalendarList(ctx, calendarService)
	if err != nil {
		ctx.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Failed to get calendar list", "error_message": err.Error()},
		)

		return
	}

	ctx.JSON(http.StatusOK, calendarList)
}
