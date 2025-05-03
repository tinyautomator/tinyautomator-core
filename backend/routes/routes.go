package routes

import (
	"time"

	"github.com/gin-contrib/timeout"
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

	workflowController := controllers.NewWorkflowController(cfg)

	workflowGroup := r.Group("/api/workflow")

	{
		workflowGroup.GET("/:id", workflowController.GetWorkflow)
		workflowGroup.POST("/", timeout.New(
			timeout.WithTimeout(3*time.Second),
			timeout.WithHandler(workflowController.CreateWorkflow),
		))
		workflowGroup.POST("/run/:id", workflowController.RunWorkflow)
	}

	workflowGroup.GET("/:id", workflowController.GetWorkflow)
	workflowGroup.POST("/", timeout.New(
		timeout.WithTimeout(3*time.Second),
		timeout.WithHandler(workflowController.CreateWorkflow),
	))


	gmailController := controllers.NewGmailController(cfg)

	gmailGroup := r.Group("/api/integrations/gmail")
	gmailGroup.GET("/auth-url", gmailController.GetGmailAuthURL)
	gmailGroup.GET("/callback", gmailController.HandleCallBack)
	gmailGroup.POST("/send-email", gmailController.SendEmail)
}
