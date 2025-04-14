package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/tinyautomator/tinyautomator-core/backend/controllers"
)

func RegisterWorkflowRoutes(r *gin.Engine, controller controllers.WorkflowController) {
	group := r.Group("/api/workflow")
	{
		group.GET("/:id", controller.GetWorkflow)
		group.POST("/", controller.CreateWorkflow)
	}
}
