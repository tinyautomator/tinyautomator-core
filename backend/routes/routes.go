package routes

import (
	"time"

	"github.com/gin-contrib/timeout"
	"github.com/gin-gonic/gin"
	"github.com/tinyautomator/tinyautomator-core/backend/controllers"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
)

func RegisterRoutes(r *gin.Engine, cfg models.AppConfig) {
	r.GET("/healthcheck", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "TinyAutomator backend is live 🚀",
		})
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
	}

	workflowRunController := controllers.NewWorkflowRunController(cfg)
	workflowRunGroup := r.Group("/api/workflow-run")
	{
		// TODO: add timeout
		workflowRunGroup.POST("/:id", workflowRunController.RunWorkflow)
		workflowRunGroup.GET("/:id/progress", workflowRunController.StreamWorkflowRunProgress)
	}

	gmailController := controllers.NewGmailController(cfg)
	gmailGroup := r.Group("/api/integrations/gmail")
	{
		gmailGroup.GET("/auth-url", gmailController.GetGmailAuthURL)
		gmailGroup.GET("/callback", gmailController.HandleCallBack)
		gmailGroup.POST("/send-email", gmailController.SendEmail)
	}
}
