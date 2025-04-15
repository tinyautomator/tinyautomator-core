package main

import (
	"github.com/gin-gonic/gin"
	"github.com/tinyautomator/tinyautomator-core/backend/config"
	"github.com/tinyautomator/tinyautomator-core/backend/controllers"
	repo "github.com/tinyautomator/tinyautomator-core/backend/repositories"
	"github.com/tinyautomator/tinyautomator-core/backend/routes"
)

func main() {
	r := gin.Default()

	r.GET("/healthcheck", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "TinyAutomator backend is live 🚀",
		})
	})

	cfg, _ := config.NewAppConfig()
	db := cfg.GetDB()
	routes.RegisterWorkflowRoutes(r, controllers.NewWorkflowController(repo.NewWorkflowRepository(db)))

	if err := r.Run(":9000"); err != nil {
		panic("Failed to start server: " + err.Error())
	}
}
