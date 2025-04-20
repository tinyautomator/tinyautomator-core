package config

import (
	"time"

	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/repositories"
	"golang.org/x/oauth2"
)

const (
	DEVELOPMENT = "development"
	PRODUCTION  = "production"
)

type EnvironmentVariables struct {
	LogLevel                  string        `envconfig:"LOG_LEVEL"                       default:"INFO"`
	ClerkSecretKey            string        `envconfig:"CLERK_SECRET_KEY"`
	Port                      string        `envconfig:"PORT"                            default:"9000"`
	WorkerPollIntervalMinutes time.Duration `envconfig:"WORKER_POLLING_INTERVAL_MINUTES" default:"10m"`

	// Gmail Variables
	GmailClientID     string   `envconfig:"GMAIL_CLIENT_ID"`
	GmailClientSecret string   `envconfig:"GMAIL_CLIENT_SECRET"`
	GmailRedirectURL  string   `envconfig:"GMAIL_REDIRECT_URL"`
	GmailScopes       []string `envconfig:"GMAIL_SCOPES"`
}

type AppConfig interface {
	GetEnv() string
	GetEnvVars() EnvironmentVariables
	GetLogger() logrus.FieldLogger

	GetWorkflowRepository() repositories.WorkflowRepository
	GetWorkflowScheduleRepository() repositories.WorkflowScheduleRepository

	GetGmailOAuthConfig() *oauth2.Config
}

type appConfig struct {
	// app
	env     string
	envVars EnvironmentVariables
	logger  logrus.FieldLogger

	// repositories
	workflowRepository         repositories.WorkflowRepository
	workflowScheduleRepository repositories.WorkflowScheduleRepository

	// oauth
	gmailOAuthConfig *oauth2.Config
}

var cfg *appConfig

func NewAppConfig() (AppConfig, error) {
	if cfg != nil {
		cfg.GetLogger().Info("Config object is already initialized")

		return cfg, nil
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

	cfg.initExternalServices()

	return cfg, nil
}

func (cfg *appConfig) GetEnv() string {
	return cfg.env
}

func (cfg *appConfig) GetEnvVars() EnvironmentVariables {
	return cfg.envVars
}

func (cfg *appConfig) GetLogger() logrus.FieldLogger {
	return cfg.logger
}

func (cfg *appConfig) GetWorkflowRepository() repositories.WorkflowRepository {
	return cfg.workflowRepository
}

func (cfg *appConfig) GetWorkflowScheduleRepository() repositories.WorkflowScheduleRepository {
	return cfg.workflowScheduleRepository
}

func (cfg *appConfig) GetGmailOAuthConfig() *oauth2.Config {
	return cfg.gmailOAuthConfig
}

var _ AppConfig = (*appConfig)(nil)
