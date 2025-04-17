package config

import (
	"database/sql"
	"errors"
	"fmt"
	"os"
	"strings"

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/joho/godotenv"
	"github.com/kelseyhightower/envconfig"
	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/db/dao"
	"github.com/tinyautomator/tinyautomator-core/backend/repositories"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
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
		return fmt.Errorf("unable to load required env files: %w", err)
	}

	if cfg.env == DEVELOPMENT {
		if err := godotenv.Overload(".env." + DEVELOPMENT + ".local"); err != nil {
			return fmt.Errorf("unable to load local env file: %w", err)
		}
	}

	if err := envconfig.Process("", &cfg.envVars); err != nil {
		return fmt.Errorf("unable to process env vars: %w", err)
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
		return fmt.Errorf("unable to parse log level: %w", err)
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
	db, err := sql.Open("sqlite", "file:dev.db?_foreign_keys=on")
	if err != nil {
		return fmt.Errorf("failed to open db: %w", err)
	}

	cfg.workflowRepository = repositories.NewWorkflowRepository(dao.New(db))

	return nil
}

func (cfg *appConfig) initExternalServices() {
	clerk.SetKey(cfg.envVars.ClerkSecretKey)

	cfg.gmailOAuthConfig = &oauth2.Config{
		ClientID:     cfg.envVars.GmailClientID,
		ClientSecret: cfg.envVars.GmailClientSecret,
		RedirectURL:  cfg.envVars.GmailRedirectURL,
		Scopes:       cfg.envVars.GmailScopes,
		Endpoint:     google.Endpoint,
	}
}
