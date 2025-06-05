package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
)

type AccountController struct {
	logger         logrus.FieldLogger
	accountService models.AccountService
}

func NewAccountController(
	cfg models.AppConfig,
) *AccountController {
	return &AccountController{
		logger:         cfg.GetLogger(),
		accountService: cfg.GetAccountService(),
	}
}

type AccountWebhookData struct {
	ID string `json:"id"`
}

type AccountWebhookEvent struct {
	Data   AccountWebhookData `json:"data"`
	Object string             `json:"object"`
	Type   string             `json:"type"`
}

func (c *AccountController) HandleAccountDeleted(ctx *gin.Context) {
	var event AccountWebhookEvent
	if err := ctx.ShouldBindJSON(&event); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// TODO: Add webhook signature verification

	if event.Type != "user.deleted" {
		ctx.JSON(http.StatusOK, gin.H{"message": "Event type not handled"})
		return
	}

	userID := event.Data.ID
	if userID == "" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "User ID is required"})
		return
	}

	if err := c.accountService.DeleteUserData(ctx, userID); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user data"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "User data deleted successfully"})
}
