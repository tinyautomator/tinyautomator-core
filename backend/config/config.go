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
	_ "modernc.org/sqlite"
)

const (
	DEVELOPMENT = "development"
	PRODUCTION  = "production"
)

type EnvironmentVariables struct {
	LogLevel    string `envconfig:"LOG_LEVEL" default:"INFO"`
	ClerkApiKey string `envconfig:"CLERK_API_KEY"`
}

func (e EnvironmentVariables) validate() error {
	switch strings.ToLower(e.LogLevel) {
	case "debug", "info", "warn":
		return nil
	default:
		return errors.New("invalid log level")
	}
}

type AppConfig interface {
	GetEnv() string
	GetEnvVars() EnvironmentVariables
	Log() *logrus.Logger
	GetDB() *dao.Queries
}

type appConfig struct {
	env     string
	envVars EnvironmentVariables
	log     *logrus.Logger
	db      *dao.Queries
}

var config AppConfig

func NewAppConfig() (AppConfig, error) {
	if config != nil {
		config.Log().Info("Config object is already initialized")
		return config, nil
	}

	cfg := &appConfig{}

	if err := cfg.loadEnvironmentVariables(); err != nil {
		return nil, err
	}

	if err := cfg.configureLogger(); err != nil {
		return nil, err
	}

	if err := cfg.configureDB(); err != nil {
		return nil, err
	}

	clerk.SetKey(cfg.envVars.ClerkApiKey)

	config = cfg
	return cfg, nil
}

func (cfg *appConfig) GetEnv() string {
	return cfg.env
}

func (cfg *appConfig) GetEnvVars() EnvironmentVariables {
	return cfg.envVars
}

func (cfg *appConfig) Log() *logrus.Logger {
	return cfg.log
}

func (cfg *appConfig) GetDB() *dao.Queries {
	return cfg.db
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

func (cfg *appConfig) configureLogger() error {
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

func (cfg *appConfig) configureDB() error {
	conn, err := sql.Open("sqlite", "file:dev.db?_foreign_keys=on")
	if err != nil {
		cfg.Log().Fatalf("Failed to open db: %v", err)
	}

	cfg.db = dao.New(conn)
	return nil
}
