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
	logger := logrus.New()
	logger.SetOutput(os.Stdout)

	if logLevel, err := logrus.ParseLevel(cfg.envVars.LogLevel); err != nil {
		return fmt.Errorf("unable to parse log level: %w", err)
	} else {
		logger.SetLevel(logLevel)
	}

	if cfg.env == PRODUCTION {
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

func (cfg *appConfig) initRepositories() error {
	q := dao.New(cfg.pool)
	cfg.workflowRepository = repositories.NewWorkflowRepository(q, cfg.pool)
	cfg.workflowScheduleRepository = repositories.NewWorkflowScheduleRepository(q, cfg.pool)
	cfg.workflowRunRepository = repositories.NewWorkflowRunRepository(q, cfg.pool)

	return nil
}

func (cfg *appConfig) initExternalServices(ctx context.Context) error {
	clerk.SetKey(cfg.envVars.ClerkSecretKey)

	cfg.gmailOAuthConfig = &oauth2.Config{
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

	cfg.pool = pool

	redisClient, err := redis.NewRedisClient(cfg.envVars.RedisUrl, cfg.logger)
	if err != nil {
		return fmt.Errorf("failed to initialize Redis client: %w", err)
	}

	cfg.redisClient = redisClient

	rabbitMQClient, err := rabbitmq.NewRabbitMQClient(cfg.envVars.RabbitMQUrl, cfg.logger)
	if err != nil {
		return fmt.Errorf("failed to initialize RabbitMQ client: %w", err)
	}

	cfg.rabbitMQClient = rabbitMQClient

	return nil
}
