package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/clients/google"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
	"golang.org/x/oauth2"
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

func (c *CalendarController) CreateEvent(ctx *gin.Context) {
	user, ok := ctx.Get("user")
	if !ok {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "user not found"})
		return
	}

	userID := user.(*models.User).ID

	// Note: This would be some kind of service that does all this

	token, err := c.oauthService.GetToken(ctx, userID, "google", c.oauthConfig)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get OAuth credentials"})
		return
	}

	calendarClient, err := google.NewCalendarClient(
		ctx,
		token,
		c.oauthConfig,
		c.logger,
		userID,
		"",
	)
	if err != nil {
		ctx.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Failed to initialize calendar client"},
		)

		return
	}

	var eventConfig models.EventConfig
	if err := ctx.ShouldBindJSON(&eventConfig); err != nil {
		c.logger.WithError(err).Error("Failed to bind JSON")
		ctx.JSON(
			http.StatusBadRequest,
			gin.H{"error": "Invalid event configuration", "details": err.Error()},
		)

		return
	}

	event, err := calendarClient.BuildEvent(&eventConfig)
	if err != nil {
		c.logger.WithError(err).Error("Failed to build event")
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})

		return
	}

	c.logger.WithField("event", event).Info("Creating event")

	createdEvent, err := calendarClient.CreateEvent(ctx, event)
	if err != nil {
		c.logger.WithError(err).Error("Failed to create event")
		ctx.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Failed to create event", "details": err.Error()},
		)

		return
	}

	ctx.JSON(http.StatusCreated, createdEvent)
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

	calendarClient, err := google.NewCalendarClient(
		ctx,
		token,
		c.oauthConfig,
		c.logger,
		userID,
		"",
	)
	if err != nil {
		ctx.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Failed to initialize calendar client"},
		)

		return
	}

	calendarList, err := calendarClient.GetCalendarList(ctx)
	if err != nil {
		ctx.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Failed to get calendar list", "error_message": err.Error()},
		)

		return
	}

	ctx.JSON(http.StatusOK, calendarList)
}
