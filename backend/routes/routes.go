package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/tinyautomator/tinyautomator-core/backend/config"
	"github.com/tinyautomator/tinyautomator-core/backend/controllers"
)

func RegisterRoutes(r *gin.Engine, cfg config.AppConfig) {
	r.GET("/healthcheck", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "TinyAutomator backend is live 🚀",
		})
	})

	workflowController := controllers.NewWorkflowController(cfg.GetWorkflowRepository())

	workflowGroup := r.Group("/api/workflow")
	{
		workflowGroup.GET("/:id", workflowController.GetWorkflow)
		workflowGroup.POST("/", workflowController.CreateWorkflow)
	}

	gmailController := controllers.NewGmailController()

	gmailGroup := r.Group("/api/integrations/gmail")
	{
		gmailGroup.GET("/auth-url", gmailController.GetGmailAuthURL)
		gmailGroup.GET("/callback", gmailController.HandleCallBack)
		gmailGroup.POST("/send-email", gmailController.SendEmail)
	}

}
