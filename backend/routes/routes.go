package routes

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/clerk/clerk-sdk-go/v2/jwt"
	"github.com/clerk/clerk-sdk-go/v2/user"
	"github.com/gin-contrib/timeout"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/controllers"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
)

func RegisterRoutes(r *gin.Engine, cfg models.AppConfig, ctx context.Context) {
	r.GET("/healthcheck", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "TinyAutomator backend is live 🚀",
		})
	})

	r.Use(func(ctx *gin.Context) {
		// Question: don't we do this config init
		clerk.SetKey(cfg.GetEnvVars().ClerkSecretKey)
		sessionToken := strings.TrimPrefix(ctx.GetHeader("Authorization"), "Bearer ")
		claims, err := jwt.Verify(ctx.Request.Context(), &jwt.VerifyParams{
			Token: sessionToken,
		})

		if err != nil {
			cfg.GetLogger().WithError(err).Error("Failed to verify session")
			ctx.JSON(http.StatusUnauthorized, gin.H{
				"message": "Unauthorized",
			})
			ctx.Abort()
			return
		}

		usr, err := user.Get(ctx.Request.Context(), claims.Subject)
		if err != nil {
			cfg.GetLogger().WithError(err).Error("Failed to get user")
			ctx.JSON(http.StatusUnauthorized, gin.H{
				"message": "Unauthorized",
			})
			ctx.Abort()
			return
		}
		cfg.GetLogger().WithFields(logrus.Fields{
			"user_id":     usr.ID,
			"user_banned": usr.Banned,
			"user_email":  usr.EmailAddresses[0].EmailAddress,
		}).Info("User")
		ctx.Next()
	})

	workflowController := controllers.NewWorkflowController(cfg)
	workflowGroup := r.Group("/api/workflow")
	{
		workflowGroup.GET("", workflowController.GetUserWorkflows)
		workflowGroup.GET("/:id", workflowController.GetWorkflow)
		workflowGroup.GET("/:id/render", workflowController.GetWorkflowRender)
		workflowGroup.POST("", timeout.New(
			timeout.WithTimeout(3*time.Second),
			timeout.WithHandler(workflowController.CreateWorkflow),
		))
		workflowGroup.PUT("/:id", timeout.New(
			timeout.WithTimeout(3*time.Second),
			timeout.WithHandler(workflowController.UpdateWorkflow),
		))
		workflowGroup.PATCH("/:id/archive", workflowController.ArchiveWorkflow)
	}

	workflowRunController := controllers.NewWorkflowRunController(cfg, ctx)
	workflowRunGroup := r.Group("/api/workflow-run")
	{
		workflowRunGroup.GET("/:id", workflowRunController.GetWorkflowRun)
		// TODO: add timeout
		workflowRunGroup.POST("/:id", workflowRunController.RunWorkflow)
		workflowRunGroup.GET("/:id/progress", workflowRunController.StreamWorkflowRunProgress)
	}

	workflowRunsGroup := r.Group("/api/workflow-runs")
	{
		workflowRunsGroup.GET("", workflowRunController.GetUserWorkflowRuns)
		workflowRunsGroup.GET("/:workflowID", workflowRunController.GetWorkflowRuns)
	}

	gmailController := controllers.NewGmailController(cfg)
	gmailGroup := r.Group("/api/integrations/gmail")
	{
		gmailGroup.GET("/auth-url", gmailController.GetGmailAuthURL)
		gmailGroup.GET("/callback", gmailController.HandleCallBack)
		gmailGroup.POST("/send-email", gmailController.SendEmail)
	}
}
