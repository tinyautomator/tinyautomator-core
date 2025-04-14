package main

import (
	"database/sql"

	"github.com/gin-gonic/gin"
	"github.com/tinyautomator/tinyautomator-core/backend/config"
	"github.com/tinyautomator/tinyautomator-core/backend/controllers"
	"github.com/tinyautomator/tinyautomator-core/backend/db/dao"
	repo "github.com/tinyautomator/tinyautomator-core/backend/repositories"
	"github.com/tinyautomator/tinyautomator-core/backend/routes"
	_ "modernc.org/sqlite"
)

func main() {
	// TODO: do stuff with this later
	cfg, _ := config.NewAppConfig()
	cfg.Log().Info("config is setup")

	// Connect to SQLite (for dev)
	db, err := sql.Open("sqlite", "file:dev.db?_foreign_keys=on")
	if err != nil {
		cfg.Log().Fatalf("❌ failed to open db: %v", err)
	}

	q := dao.New(db)
	r := gin.Default()

	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "TinyAutomator backend is live 🚀",
		})
	})

	routes.RegisterWorkflowRoutes(r, controllers.NewWorkflowController(repo.NewWorkflowRepository(q)))

	if err := r.Run(":9000"); err != nil {
		panic("Failed to start server: " + err.Error())
	}
}
