package main

import (
	"database/sql"

	"github.com/gin-gonic/gin"
	"github.com/tinyautomator/tinyautomator-core/backend/config"
	"github.com/tinyautomator/tinyautomator-core/backend/db/dao"
	"github.com/tinyautomator/tinyautomator-core/backend/internal/workflow"
	repo "github.com/tinyautomator/tinyautomator-core/backend/repositories"
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

	r := gin.Default()

	r.GET("/", func(c *gin.Context) {
		// Create sqlc query handler
		q := dao.New(db)

		if err != nil {
			if err == sql.ErrNoRows {
				cfg.Log().Info("users not found.")
			} else {
				cfg.Log().Fatalf("❌ query failed: %v", err)
			}
			return
		}

		r := repo.NewWorkflowRepository(q)
		nodes, edges, err := workflow.LoadWorkflowGraph(c, r, 1)

		if err != nil {
			c.JSON(400, err)
		}

		err = workflow.ExecuteWorkflow(cfg, nodes, edges)

		if err != nil {
			c.JSON(400, err)
		}

		// c.JSON(200, gin.H{
		// 	"message": "TinyAutomator backend is live 🚀",
		// })
		c.JSON(200, gin.H{
			"nodes": nodes,
			"edges": edges,
		})
	})

	if err := r.Run(":9000"); err != nil {
		panic("Failed to start server: " + err.Error())
	}
}
