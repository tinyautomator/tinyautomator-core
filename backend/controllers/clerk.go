package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
)

type ClerkWebhookController interface {
	HandleUserDeleted(ctx *gin.Context)
}

type clerkWebhookController struct {
	logger       logrus.FieldLogger
	cfg          models.AppConfig
	oauthRepo    models.OauthIntegrationRepository
	workflowRepo models.WorkflowRepository
}

func NewClerkWebhookController(cfg models.AppConfig) ClerkWebhookController {
	return &clerkWebhookController{
		logger:       cfg.GetLogger(),
		cfg:          cfg,
		oauthRepo:    cfg.GetOauthIntegrationRepository(),
		workflowRepo: cfg.GetWorkflowRepository(),
	}
}

type ClerkWebhookData struct {
	ID string `json:"id"`
}

type ClerkWebhookEvent struct {
	Data   ClerkWebhookData `json:"data"`
	Object string           `json:"object"`
	Type   string           `json:"type"`
}

func (c *clerkWebhookController) HandleUserDeleted(ctx *gin.Context) {
	var event ClerkWebhookEvent
	if err := ctx.ShouldBindJSON(&event); err != nil {
		c.logger.WithError(err).Error("Failed to parse webhook payload")
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid webhook payload"})

		return
	}

	// TODO: Add webhook signature verification

	if event.Type != "user.deleted" {
		ctx.JSON(http.StatusOK, gin.H{"message": "Event type not handled"})
		return
	}

	userID := event.Data.ID
	if userID == "" {
		c.logger.Error("User ID missing from webhook payload")
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "User ID missing"})

		return
	}

	workflows, err := c.workflowRepo.GetUserWorkflows(ctx, userID)
	if err != nil {
		c.logger.WithError(err).Error("Failed to fetch user workflows")
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process user deletion"})

		return
	}

	for _, workflow := range workflows {
		if err := c.workflowRepo.ArchiveWorkflow(ctx, workflow.ID); err != nil {
			c.logger.WithError(err).
				WithField("workflow_id", workflow.ID).
				Error("Failed to archive workflow")
			ctx.JSON(
				http.StatusInternalServerError,
				gin.H{"error": "Failed to process user deletion"},
			)

			return
		}
	}

	if err := c.oauthRepo.DeleteAllByUserID(ctx, userID); err != nil {
		c.logger.WithError(err).Error("Failed to delete user OAuth integrations")
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user data"})

		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "User data deleted successfully"})
}

var _ ClerkWebhookController = (*clerkWebhookController)(nil)
