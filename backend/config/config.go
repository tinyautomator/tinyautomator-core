package config

import (
	"errors"
	"os"
	"strings"

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/joho/godotenv"
	"github.com/kelseyhightower/envconfig"
	"github.com/sirupsen/logrus"
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

type AppConfigIFace interface {
	GetEnv() string
	GetEnvVars() EnvironmentVariables
	Log() *logrus.Logger
}

type AppConfig struct {
	env     string
	envVars EnvironmentVariables
	log     *logrus.Logger
}

func NewAppConfig() (*AppConfig, error) {
	cfg := &AppConfig{
		log: logrus.New(),
	}

	if err := cfg.loadEnvironmentVariables(); err != nil {
		return nil, err
	}

	if err := cfg.configureLogger(); err != nil {
		return nil, err
	}

	clerk.SetKey(cfg.envVars.ClerkApiKey)

	return cfg, nil
}

func (cfg *AppConfig) GetEnv() string {
	return cfg.env
}

func (cfg *AppConfig) GetEnvVars() EnvironmentVariables {
	return cfg.envVars
}

func (cfg *AppConfig) Log() *logrus.Logger {
	return cfg.log
}

func (cfg *AppConfig) loadEnvironmentVariables() error {
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

func (cfg *AppConfig) configureLogger() error {
	cfg.log.SetOutput(os.Stdout)

	if logLevel, err := logrus.ParseLevel(cfg.envVars.LogLevel); err != nil {
		return err
	} else {
		cfg.log.SetLevel(logLevel)
	}

	if cfg.env == PRODUCTION {
		cfg.log.SetFormatter(&logrus.JSONFormatter{
			PrettyPrint: false, // TODO: think about this
		})
	} else {
		// cfg.log.SetReportCaller(true)
		cfg.log.SetFormatter(&logrus.TextFormatter{
			FullTimestamp: true,
		})
	}

	// TODO: clean this up - this is just to demonstrate how to log stuff
	// cfg.Log().WithField("key", "value").Debug("test DEBUG log")
	// cfg.Log().WithField("key", "value").Info("test INFO log")
	// cfg.Log().WithField("key", "value").Warn("test WARN log")
	// cfg.Log().WithField("key", "value").Error("test ERROR log")

	return nil
}

var _ AppConfigIFace = &AppConfig{}
