package config

import (
	"database/sql"
	"errors"
	"os"
	"strings"

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/joho/godotenv"
	"github.com/kelseyhightower/envconfig"
	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/db/dao"
	"github.com/tinyautomator/tinyautomator-core/backend/repositories"
	_ "modernc.org/sqlite"
)

func (e EnvironmentVariables) validate() error {
	switch strings.ToLower(e.LogLevel) {
	case "debug", "info", "warn":
		return nil
	default:
		return errors.New("invalid log level")
	}
}

func (cfg *appConfig) loadEnvironmentVariables() error {
	if cfg.env = os.Getenv("APPLICATION_ENV"); cfg.env == "" {
		cfg.env = DEVELOPMENT
	}

	if err := godotenv.Overload(".env", ".env."+cfg.env); err != nil {
		return err
	}

	if cfg.env == DEVELOPMENT {
		if err := godotenv.Overload(".env." + DEVELOPMENT + ".local"); err != nil {
			return err
		}
	}

	if err := envconfig.Process("", &cfg.envVars); err != nil {
		return err
	}

	if err := cfg.envVars.validate(); err != nil {
		return err
	}

	return nil
}

func (cfg *appConfig) initLogger() error {
	cfg.log = logrus.New()
	cfg.log.SetOutput(os.Stdout)

	if logLevel, err := logrus.ParseLevel(cfg.envVars.LogLevel); err != nil {
		return err
	} else {
		cfg.log.SetLevel(logLevel)
	}

	if cfg.env == PRODUCTION {
		cfg.log.SetFormatter(&logrus.JSONFormatter{})
		cfg.log.SetReportCaller(true)
	} else {
		cfg.log.SetFormatter(&logrus.TextFormatter{
			FullTimestamp: true,
		})
	}
	return nil
}

func (cfg *appConfig) initRepositories() error {
	conn, err := sql.Open("sqlite", "file:dev.db?_foreign_keys=on")
	if err != nil {
		cfg.Log().Fatalf("Failed to open db: %v", err)
	}

	cfg.db = dao.New(conn)
	cfg.workflowRepository = repositories.NewWorkflowRepository(cfg.db)
	return nil
}

func (cfg *appConfig) initExternalServices() error {
	clerk.SetKey(cfg.envVars.ClerkApiKey)
	return nil
}
