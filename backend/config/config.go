package config

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/clients/rabbitmq"
	"github.com/tinyautomator/tinyautomator-core/backend/clients/redis"
	"github.com/tinyautomator/tinyautomator-core/backend/repositories"
	"golang.org/x/oauth2"
)

const (
	DEVELOPMENT = "development"
	PRODUCTION  = "production"
)

type EnvironmentVariables struct {
	LogLevel           string        `envconfig:"LOG_LEVEL"               default:"INFO"`
	ClerkSecretKey     string        `envconfig:"CLERK_SECRET_KEY"`
	Port               string        `envconfig:"PORT"                    default:"9000"`
	WorkerPollInterval time.Duration `envconfig:"WORKER_POLLING_INTERVAL" default:"10m"`

	// Gmail Variables
	GmailClientID     string   `envconfig:"GMAIL_CLIENT_ID"`
	GmailClientSecret string   `envconfig:"GMAIL_CLIENT_SECRET"`
	GmailRedirectURL  string   `envconfig:"GMAIL_REDIRECT_URL"`
	GmailScopes       []string `envconfig:"GMAIL_SCOPES"`

	// Redis
	RedisUrl string `envconfig:"REDIS_URL"`

	// Database
	PostgresUrl string `envconfig:"POSTGRES_URL"`

	// RabbitMQ
	RabbitMQUrl         string `envconfig:"RABBITMQ_URL"`
	RabbitMQQueuePrefix string `envconfig:"RABBITMQ_QUEUE_PREFIX"`
}

type AppConfig interface {
	GetEnv() string
	GetEnvVars() EnvironmentVariables
	GetLogger() logrus.FieldLogger

	GetWorkflowRepository() repositories.WorkflowRepository
	GetWorkflowScheduleRepository() repositories.WorkflowScheduleRepository
	GetWorkflowRunRepository() repositories.WorkflowRunRepository

	GetGmailOAuthConfig() *oauth2.Config
	GetRedisClient() redis.RedisClient
	GetRabbitMQClient() rabbitmq.RabbitMQClient

	CleanUp()
}

type appConfig struct {
	// app
	env     string
	envVars EnvironmentVariables
	logger  logrus.FieldLogger

	// repositories
	workflowRepository         repositories.WorkflowRepository
	workflowScheduleRepository repositories.WorkflowScheduleRepository
	workflowRunRepository      repositories.WorkflowRunRepository

	// oauth
	gmailOAuthConfig *oauth2.Config

	// external
	pool           *pgxpool.Pool
	redisClient    redis.RedisClient
	rabbitMQClient rabbitmq.RabbitMQClient
}

var cfg *appConfig

func NewAppConfig(ctx context.Context) (AppConfig, error) {
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

	if err := cfg.initExternalServices(ctx); err != nil {
		return nil, err
	}

	cfg.initRepositories()

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

func (cfg *appConfig) GetWorkflowRunRepository() repositories.WorkflowRunRepository {
	return cfg.workflowRunRepository
}

func (cfg *appConfig) GetGmailOAuthConfig() *oauth2.Config {
	return cfg.gmailOAuthConfig
}

func (cfg *appConfig) GetRedisClient() redis.RedisClient {
	return cfg.redisClient
}

func (cfg *appConfig) GetRabbitMQClient() rabbitmq.RabbitMQClient {
	return cfg.rabbitMQClient
}

func (cfg *appConfig) CleanUp() {
	if err := cfg.redisClient.Close(); err != nil {
		cfg.logger.WithError(err).Error("Failed to close Redis client")
	}

	if err := cfg.rabbitMQClient.Close(); err != nil {
		cfg.logger.WithError(err).Error("Failed to close RabbitMQ client")
	}

	cfg.pool.Close()
}

var _ AppConfig = (*appConfig)(nil)
