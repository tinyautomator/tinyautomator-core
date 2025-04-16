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

	group := r.Group("/api/workflow")
	{
		group.GET("/:id", workflowController.GetWorkflow)
		group.POST("/", workflowController.CreateWorkflow)
	}
}
