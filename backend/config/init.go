package config

import (
	"context"
	"errors"
	"fmt"
	"os"
	"strings"

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"github.com/kelseyhightower/envconfig"
	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/clients/rabbitmq"
	"github.com/tinyautomator/tinyautomator-core/backend/clients/redis"
	"github.com/tinyautomator/tinyautomator-core/backend/db/dao"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
	"github.com/tinyautomator/tinyautomator-core/backend/repositories"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	_ "modernc.org/sqlite"
)

func validateEnvVars(e *models.EnvironmentVariables) error {
	switch strings.ToLower(e.LogLevel) {
	case "debug", "info", "warn":
		return nil
	default:
		return errors.New("invalid log level")
	}
}

func (cfg *appConfig) loadEnvironmentVariables() error {
	if cfg.envVars.Env = os.Getenv("APPLICATION_ENV"); cfg.envVars.Env == "" {
		cfg.envVars.Env = DEVELOPMENT
	}

	if err := godotenv.Overload(".env", ".env."+cfg.envVars.Env); err != nil {
		return fmt.Errorf("unable to load required env files: %w", err)
	}

	if cfg.envVars.Env == DEVELOPMENT {
		if err := godotenv.Overload(".env." + DEVELOPMENT + ".local"); err != nil {
			return fmt.Errorf("unable to load local env file: %w", err)
		}
	}

	if err := envconfig.Process("", &cfg.envVars); err != nil {
		return fmt.Errorf("unable to process env vars: %w", err)
	}

	if err := validateEnvVars(&cfg.envVars); err != nil {
		return err
	}

	return nil
}

func (cfg *appConfig) initLogger() error {
	logger := logrus.New()
	logger.SetOutput(os.Stdout)

	if logLevel, err := logrus.ParseLevel(cfg.envVars.LogLevel); err != nil {
		return fmt.Errorf("unable to parse log level: %w", err)
	} else {
		logger.SetLevel(logLevel)
	}

	if cfg.envVars.Env == PRODUCTION {
		logger.SetFormatter(&logrus.JSONFormatter{})
		logger.SetReportCaller(true)
	} else {
		logger.SetFormatter(&logrus.TextFormatter{
			FullTimestamp: true,
		})
	}

	cfg.logger = logger

	return nil
}

func (cfg *appConfig) initRepositories() {
	q := dao.New(cfg.pgPool)
	cfg.workflowRepo = repositories.NewWorkflowRepository(q, cfg.pgPool)
	cfg.workflowScheduleRepo = repositories.NewWorkflowScheduleRepository(q, cfg.pgPool)
	cfg.workflowRunRepo = repositories.NewWorkflowRunRepository(q, cfg.pgPool)
}

func (cfg *appConfig) initExternalServices(ctx context.Context) error {
	clerk.SetKey(cfg.envVars.ClerkSecretKey)

	cfg.envVars.GmailOAuthConfig = &oauth2.Config{
		ClientID:     cfg.envVars.GmailClientID,
		ClientSecret: cfg.envVars.GmailClientSecret,
		RedirectURL:  cfg.envVars.GmailRedirectURL,
		Scopes:       cfg.envVars.GmailScopes,
		Endpoint:     google.Endpoint,
	}

	pool, err := pgxpool.New(ctx, cfg.envVars.PostgresUrl)
	if err != nil {
		return fmt.Errorf("failed to open db: %w", err)
	}

	cfg.pgPool = pool

	redisClient, err := redis.NewRedisClient(cfg.envVars.RedisUrl, cfg.logger)
	if err != nil {
		return fmt.Errorf("failed to initialize redis client: %w", err)
	}

	cfg.redisClient = redisClient

	rabbitMQClient, err := rabbitmq.NewRabbitMQClient(ctx, cfg.envVars.RabbitMQUrl, cfg.logger)
	if err != nil {
		return fmt.Errorf("failed to initialize rabbitmq client: %w", err)
	}

	cfg.rabbitMQClient = rabbitMQClient

	return nil
}
