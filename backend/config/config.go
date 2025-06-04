package config

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/clients/rabbitmq"
	"github.com/tinyautomator/tinyautomator-core/backend/clients/redis"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
	"github.com/tinyautomator/tinyautomator-core/backend/services"
	"golang.org/x/oauth2"
)

const (
	DEVELOPMENT = "development"
	PRODUCTION  = "production"
)

type appConfig struct {
	envVars              models.EnvironmentVariables
	logger               *logrus.Logger
	googleOAuthConfig    models.GoogleOAuthConfig
	pgPool               *pgxpool.Pool
	redisClient          redis.RedisClient
	rabbitMQClient       rabbitmq.RabbitMQClient
	workflowRepo         models.WorkflowRepository
	workflowRunRepo      models.WorkflowRunRepository
	workflowScheduleRepo models.WorkflowScheduleRepository
	oauthIntegrationRepo models.OauthIntegrationRepository
	orchestrator         models.OrchestratorService
	executor             models.ExecutorService
	scheduler            models.SchedulerService
	workflowSvc          models.WorkflowService
	oauthIntegrationSvc  models.OauthIntegrationService
	accountService       models.AccountService
}

var cfg *appConfig

func NewAppConfig(ctx context.Context) (models.AppConfig, error) {
	if cfg != nil {
		cfg.GetLogger().Info("Config object is already initialized")
		return cfg, nil
	}

	cfg = &appConfig{}

	if err := cfg.loadEnvironmentVariables(); err != nil {
		return nil, err
	}

	if err := cfg.initLogger(); err != nil {
		return nil, err
	}

	if err := cfg.initExternalServices(ctx); err != nil {
		return nil, err
	}

	cfg.initGoogleOAuthConfig()
	cfg.initRepositories()

	cfg.workflowSvc = services.NewWorkflowService(cfg)
	cfg.orchestrator = services.NewOrchestratorService(cfg)
	cfg.executor = services.NewExecutorService(cfg)
	cfg.scheduler = services.NewSchedulerService(cfg)
	cfg.oauthIntegrationSvc = services.NewOauthIntegrationService(cfg)
	cfg.accountService = services.NewAccountService(cfg)

	return cfg, nil
}

func (c *appConfig) GetEnv() string {
	return c.envVars.Env
}

func (c *appConfig) GetEnvVars() models.EnvironmentVariables {
	return c.envVars
}

func (c *appConfig) GetLogger() logrus.FieldLogger {
	return c.logger
}

func (c *appConfig) GetGoogleOAuthConfig() *oauth2.Config {
	return &c.googleOAuthConfig.Config
}

func (c *appConfig) GetPGPool() *pgxpool.Pool {
	return c.pgPool
}

func (c *appConfig) GetRedisClient() redis.RedisClient {
	return c.redisClient
}

func (c *appConfig) GetRabbitMQClient() rabbitmq.RabbitMQClient {
	return c.rabbitMQClient
}

func (c *appConfig) GetWorkflowRepository() models.WorkflowRepository {
	return c.workflowRepo
}

func (c *appConfig) GetWorkflowRunRepository() models.WorkflowRunRepository {
	return c.workflowRunRepo
}

func (c *appConfig) GetWorkflowScheduleRepository() models.WorkflowScheduleRepository {
	return c.workflowScheduleRepo
}

func (c *appConfig) GetOauthIntegrationRepository() models.OauthIntegrationRepository {
	return c.oauthIntegrationRepo
}

func (c *appConfig) GetOrchestratorService() models.OrchestratorService {
	return c.orchestrator
}

func (c *appConfig) GetExecutorService() models.ExecutorService {
	return c.executor
}

func (c *appConfig) GetSchedulerService() models.SchedulerService {
	return c.scheduler
}

func (c *appConfig) GetWorkflowService() models.WorkflowService {
	return c.workflowSvc
}

func (c *appConfig) GetOauthIntegrationService() models.OauthIntegrationService {
	return c.oauthIntegrationSvc
}

func (c *appConfig) GetAccountService() models.AccountService {
	return c.accountService
}

func (c *appConfig) CleanUp() {
	if err := c.redisClient.Close(); err != nil {
		c.logger.WithError(err).Error("failed to close redis client")
	}

	if err := c.rabbitMQClient.Close(); err != nil {
		c.logger.WithError(err).Error("failed to close rabbitmq client")
	}

	c.pgPool.Close()
}

var _ models.AppConfig = (*appConfig)(nil)
