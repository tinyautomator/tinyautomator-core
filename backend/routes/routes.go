package routes

import (
	"context"
	"time"

	"github.com/gin-contrib/timeout"
	"github.com/gin-gonic/gin"
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
		authUser(ctx, cfg.GetLogger())
		ctx.Next()
	})

	workflowController := controllers.NewWorkflowController(cfg)
	workflowGroup := r.Group("/api/workflow")
	{
		workflowGroup.GET("", workflowController.GetUserWorkflows)
		workflowGroup.GET("/:workflowID", workflowController.GetWorkflow)
		workflowGroup.GET("/:workflowID/render", workflowController.GetWorkflowRender)
		workflowGroup.POST("", timeout.New(
			timeout.WithTimeout(3*time.Second),
			timeout.WithHandler(workflowController.CreateWorkflow),
		))
		workflowGroup.PUT("/:workflowID", timeout.New(
			timeout.WithTimeout(3*time.Second),
			timeout.WithHandler(workflowController.UpdateWorkflow),
		))
		workflowGroup.PATCH("/:workflowID/archive", workflowController.ArchiveWorkflow)
	}

	workflowRunController := controllers.NewWorkflowRunController(cfg, ctx)
	workflowRunGroup := r.Group("/api/workflow-run")
	{
		workflowRunGroup.GET("/:runID", workflowRunController.GetWorkflowRun)
		// TODO: add timeout
		workflowRunGroup.POST("/:workflowID", workflowRunController.RunWorkflow)
	}

	r.GET(
		"/api/workflow-progress/:workflowID/run/:runID",
		workflowRunController.StreamWorkflowRunProgress,
	)

	workflowRunsGroup := r.Group("/api/workflow-runs")
	{
		workflowRunsGroup.GET("", workflowRunController.GetUserWorkflowRuns)
		workflowRunsGroup.GET("/:workflowID", workflowRunController.GetWorkflowRuns)
	}

	googleAuthController := controllers.NewGoogleAuthController(cfg)
	googleAuthGroup := r.Group("/api/integrations/google")
	{
		googleAuthGroup.GET("/auth-url", googleAuthController.GetGoogleAuthURL)
		googleAuthGroup.GET("/callback", googleAuthController.HandleCallBack)
	}

	accountController := controllers.NewAccountController(cfg)
	r.POST("/api/webhooks/delete-account", accountController.HandleAccountDeleted)
}
