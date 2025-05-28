package main

import (
	"context"
	"net/http"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/tinyautomator/tinyautomator-core/backend/config"
	"github.com/tinyautomator/tinyautomator-core/backend/routes"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	cfg, err := config.NewAppConfig(ctx)
	if err != nil {
		panic("failed to initialize config " + err.Error())
	}
	defer cfg.CleanUp()

	routes.RegisterRoutes(r, cfg, ctx)

	srv := &http.Server{
		Addr:         ":" + cfg.GetEnvVars().Port,
		Handler:      r,
		ReadTimeout:  0,
		WriteTimeout: 0,
		IdleTimeout:  0,
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			panic("failed to start server: " + err.Error())
		}
	}()

	<-ctx.Done()
	cfg.GetLogger().Info("signal received - shutting down gracefully")

	// TODO: add this to config
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 2500*time.Millisecond)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		cfg.GetLogger().Info("server forced to shutdown: ", err)
	}

	cfg.GetLogger().Info("server shut down successfully")
}
