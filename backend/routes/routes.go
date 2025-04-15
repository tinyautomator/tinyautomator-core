package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/tinyautomator/tinyautomator-core/backend/controllers"
)

func RegisterRoutes(r *gin.Engine, controller controllers.WorkflowController) {
	api := r.Group("/api")
	{
		api.GET("/workflows/:id/render", controller.GetWorkflowRender)
	}
}
