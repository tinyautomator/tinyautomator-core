package config

import (
	"context"
	"encoding/hex"
	"errors"
	"fmt"
	"os"
	"runtime"
	"strings"

	formatter "github.com/antonfisher/nested-logrus-formatter"
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
		break
	default:
		return errors.New("invalid log level")
	}

	if _, err := hex.DecodeString(e.TokenEncryptionKey); err != nil {
		return fmt.Errorf("failed to decode token encryption key: %w", err)
	}

	return nil
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
	logger.SetReportCaller(true)

	if logLevel, err := logrus.ParseLevel(cfg.envVars.LogLevel); err != nil {
		return fmt.Errorf("unable to parse log level: %w", err)
	} else {
		logger.SetLevel(logLevel)
	}

	if cfg.envVars.Env == PRODUCTION {
		logger.SetFormatter(&logrus.JSONFormatter{})
		logger.SetReportCaller(true)
	} else {
		logger.SetFormatter(&formatter.Formatter{
			ShowFullLevel: true,
			TrimMessages:  true,
			CallerFirst:   false,
			CustomCallerFormatter: func(frame *runtime.Frame) string {
				gray := "\033[90m"
				reset := "\033[0m"
				path := frame.File
				function := frame.Function

				if idx := strings.Index(frame.File, "backend/"); idx != -1 {
					path = path[idx+8:]
				}

				if idx := strings.Index(frame.Function, "github.com/tinyautomator/tinyautomator-core/backend/"); idx != -1 {
					function = function[idx+len("github.com/tinyautomator/tinyautomator-core/backend/"):]
				}

				return fmt.Sprintf(" %s(%s:%d %s)%s", gray, path, frame.Line, function, reset)
			},
		})
	}

	cfg.logger = logger

	return nil
}

func (cfg *appConfig) initGoogleOAuthConfig() {
	cfg.googleOAuthConfig = models.GoogleOAuthConfig{
		Config: oauth2.Config{
			ClientID:     "720103258164-islfsu2b9b8dsm6btt1trrtf1epropkf.apps.googleusercontent.com",
			ClientSecret: cfg.envVars.GoogleClientSecret,
			RedirectURL:  "http://localhost:9000/api/integrations/google/callback",
			Scopes: []string{
				"https://www.googleapis.com/auth/gmail.readonly",
				"https://www.googleapis.com/auth/gmail.send",
				"https://www.googleapis.com/auth/adwords",
				"https://www.googleapis.com/auth/spreadsheets",
				"https://www.googleapis.com/auth/drive",
				"https://www.googleapis.com/auth/docs",
				"https://www.googleapis.com/auth/userinfo.email",
				"https://www.googleapis.com/auth/userinfo.profile",
				"openid",

				// calendar
				// Note: for development, we just get all scropes
				"https://www.googleapis.com/auth/calendar",
			},
			Endpoint: google.Endpoint,
		},
	}
}

func (cfg *appConfig) initRepositories() {
	q := dao.New(cfg.pgPool)
	cfg.workflowRepo = repositories.NewWorkflowRepository(q, cfg.pgPool)
	cfg.workflowScheduleRepo = repositories.NewWorkflowScheduleRepository(q, cfg.pgPool)
	cfg.workflowCalendarRepo = repositories.NewWorkflowCalendarRepository(q, cfg.pgPool)
	cfg.workflowRunRepo = repositories.NewWorkflowRunRepository(q, cfg.pgPool)
	cfg.oauthIntegrationRepo = repositories.NewOauthIntegrationRepository(q, cfg.pgPool)
}

func (cfg *appConfig) initExternalServices(ctx context.Context) error {
	clerk.SetKey(cfg.envVars.ClerkSecretKey)

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
