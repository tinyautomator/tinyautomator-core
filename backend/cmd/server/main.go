package main

import (
	"context"

	"github.com/gin-gonic/gin"
	"github.com/tinyautomator/tinyautomator-core/backend/config"
	"github.com/tinyautomator/tinyautomator-core/backend/routes"
)

func main() {
	r := gin.Default()

	cfg, err := config.NewAppConfig(context.Background())
	if err != nil {
		panic("Failed to initialize config " + err.Error())
	}

	defer cfg.CleanUp()

	routes.RegisterRoutes(r, cfg)

	if err := r.Run(":" + cfg.GetEnvVars().Port); err != nil {
		panic("Failed to start server: " + err.Error())
	}
}
