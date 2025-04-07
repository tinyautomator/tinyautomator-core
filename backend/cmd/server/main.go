package main

import (
	"github.com/gin-gonic/gin"
	"github.com/tinyautomator/tinyautomator-core/backend/config"
)

func main() {
	// TODO: do stuff with this later
	cfg, _ := config.NewAppConfig()
	cfg.Log().Info("config is setup")

	r := gin.Default()

	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "TinyAutomator backend is live 🚀",
		})
	})

	if err := r.Run(":9000"); err != nil {
		panic("Failed to start server: " + err.Error())
	}
}
