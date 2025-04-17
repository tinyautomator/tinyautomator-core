package main

import (
	"github.com/gin-gonic/gin"
	"github.com/tinyautomator/tinyautomator-core/backend/config"
	"github.com/tinyautomator/tinyautomator-core/backend/routes"
)

func main() {
	r := gin.Default()
	cfg, err := config.NewAppConfig()
	if err != nil {
		panic("Failed to initialize config " + err.Error())
	}

	routes.RegisterRoutes(r, cfg)

	if err := r.Run(":" + cfg.GetEnvVars().Port); err != nil {
		panic("Failed to start server: " + err.Error())
	}
}
