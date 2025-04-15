package config

import (
	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/db/dao"
	"github.com/tinyautomator/tinyautomator-core/backend/repositories"
)

const (
	DEVELOPMENT = "development"
	PRODUCTION  = "production"
)

type EnvironmentVariables struct {
	LogLevel    string `envconfig:"LOG_LEVEL" default:"INFO"`
	ClerkApiKey string `envconfig:"CLERK_API_KEY"`
	Port        string `envconfig:"PORT" default:"9000"`
}

type AppConfig interface {
	GetEnv() string
	GetEnvVars() EnvironmentVariables
	Log() *logrus.Logger

	GetWorkflowRepository() repositories.WorkflowRepository
}

type appConfig struct {
	env     string
	envVars EnvironmentVariables
	log     *logrus.Logger
	db      *dao.Queries

	workflowRepository repositories.WorkflowRepository
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

	if err := cfg.initLogger(); err != nil {
		return nil, err
	}

	if err := cfg.initRepositories(); err != nil {
		return nil, err
	}

	if err := cfg.initExternalServices(); err != nil {
		return nil, err
	}

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

func (cfg *appConfig) GetWorkflowRepository() repositories.WorkflowRepository {
	return cfg.workflowRepository
}
