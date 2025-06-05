package models

import (
	"context"
	"time"

	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/clients/rabbitmq"
	"github.com/tinyautomator/tinyautomator-core/backend/clients/redis"
	"golang.org/x/oauth2"
)

type EnvironmentVariables struct {
	LogLevel           string        `envconfig:"LOG_LEVEL"               default:"INFO"`
	ClerkSecretKey     string        `envconfig:"CLERK_API_KEY"                                 required:"true"`
	Port               string        `envconfig:"PORT"                    default:"9000"`
	WorkerPollInterval time.Duration `envconfig:"WORKER_POLLING_INTERVAL" default:"10m"`
	Env                string        `envconfig:"APPLICATION_ENV"         default:"development"`

	// Oauth
	JwtSecret          string `envconfig:"JWT_SECRET"           required:"true"`
	TokenEncryptionKey string `envconfig:"TOKEN_ENCRYPTION_KEY" required:"true"`
	GoogleClientSecret string `envconfig:"GOOGLE_CLIENT_SECRET" required:"true"`

	// Redis
	RedisUrl string `envconfig:"REDIS_URL"`

	// Database
	PostgresUrl string `envconfig:"POSTGRES_URL"`

	// RabbitMQ
	RabbitMQUrl         string `envconfig:"RABBITMQ_URL"`
	RabbitMQQueuePrefix string `envconfig:"RABBITMQ_QUEUE_PREFIX"`
}

type GoogleOAuthConfig struct {
	oauth2.Config
}

type AppConfig interface {
	GetEnv() string
	GetEnvVars() EnvironmentVariables
	GetLogger() logrus.FieldLogger

	GetWorkflowRepository() WorkflowRepository
	GetWorkflowScheduleRepository() WorkflowScheduleRepository
	GetWorkflowRunRepository() WorkflowRunRepository
	GetOauthIntegrationRepository() OauthIntegrationRepository
	GetOrchestratorService() OrchestratorService
	GetExecutorService() ExecutorService
	GetSchedulerService() SchedulerService
	GetWorkflowService() WorkflowService
	GetOauthIntegrationService() OauthIntegrationService
	GetAccountService() AccountService
	GetGoogleOAuthConfig() *oauth2.Config
	GetRedisClient() redis.RedisClient
	GetRabbitMQClient() rabbitmq.RabbitMQClient

	CleanUp()
}

type WorkflowRepository interface {
	GetWorkflowNode(ctx context.Context, id int32) (*WorkflowNode, error)
	GetWorkflow(ctx context.Context, id int32) (*Workflow, error)
	GetUserWorkflows(ctx context.Context, userID string) ([]*Workflow, error)
	CreateWorkflow(
		ctx context.Context,
		userID string,
		name string,
		description string,
		status string,
		nodes []*WorkflowNodeDTO,
		edges []*WorkflowEdgeDTO,
	) (*WorkflowGraph, error)
	UpdateWorkflow(
		ctx context.Context,
		workflowID int32,
		delta *WorkflowDelta,
		existingNodes []*WorkflowNodeDTO,
	) error
	GetWorkflowGraph(ctx context.Context, workflowID int32) (*WorkflowGraph, error)
	RenderWorkflowGraph(ctx context.Context, workflowID int32) (*WorkflowGraphDTO, error)
	ArchiveWorkflow(ctx context.Context, workflowID int32) error
}

type WorkflowRunRepository interface {
	WithTransaction(
		ctx context.Context,
		fn func(ctx context.Context, txRepo WorkflowRunRepository) error,
	) error
	GetWorkflowRun(ctx context.Context, id int32) (*WorkflowRunWithNodesDTO, error)
	GetWorkflowRuns(ctx context.Context, workflowID int32) ([]*WorkflowRunCore, error)
	GetUserWorkflowRuns(ctx context.Context, userID string) ([]*UserWorkflowRunDTO, error)
	GetWorkflowNodeRun(
		ctx context.Context,
		workflowRunID int32,
		nodeID int32,
	) (*WorkflowNodeRunCore, error)
	GetWorkflowNodeRuns(
		ctx context.Context,
		workflowRunID int32,
		status *string,
	) ([]*WorkflowNodeRunCore, error)
	GetParentWorkflowNodeRuns(
		ctx context.Context,
		workflowRunID int32,
		nodeID int32,
	) ([]*WorkflowNodeRunCore, error)
	GetChildWorkflowNodeRuns(
		ctx context.Context,
		workflowRunID int32,
		nodeID int32,
	) ([]*WorkflowNodeRunCore, error)
	CreateWorkflowRun(
		ctx context.Context,
		workflowID int32,
		nodes []ValidateNode,
	) (*WorkflowRunWithNodesDTO, error)
	CompleteWorkflowRun(ctx context.Context, workflowRunID int32, status string) error
	MarkWorkflowNodeAsRunning(
		ctx context.Context,
		workflowNodeRunID int32,
		startedAt int64,
		retryCount int32,
	) error
	UpdateWorkflowNodeRunStatus(
		ctx context.Context,
		workflowNodeRunID int32,
		status string,
		errorMessage *string,
	) error
}

type WorkflowScheduleRepository interface {
	GetDueSchedulesLocked(ctx context.Context) ([]*WorkflowSchedule, error)
	Create(
		ctx context.Context,
		workflowID int32,
		scheduleType string,
		nextRunAt int64,
		executionState string,
	) (*WorkflowSchedule, error)
	UpdateWorkflowSchedule(
		ctx context.Context,
		workflowID int32,
		scheduleType string,
		nextRunAt *int64,
		lastRunAt *int64,
	) error
	DeleteWorkflowScheduleByWorkflowID(ctx context.Context, workflowID int32) error
}

type OrchestratorService interface {
	OrchestrateWorkflow(ctx context.Context, userID string, workflowID int32) (int32, error)
}

type ExecutorService interface {
	ExecuteWorkflowNode(ctx context.Context, msg []byte) error
}

type ScheduleType string

const (
	ScheduleTypeOnce    ScheduleType = "once"
	ScheduleTypeDaily   ScheduleType = "daily"
	ScheduleTypeWeekly  ScheduleType = "weekly"
	ScheduleTypeMonthly ScheduleType = "monthly"
)

var ScheduleTypes = map[string]ScheduleType{
	"once":    ScheduleTypeOnce,
	"daily":   ScheduleTypeDaily,
	"weekly":  ScheduleTypeWeekly,
	"monthly": ScheduleTypeMonthly,
}

type SchedulerService interface {
	GetDueWorkflows(ctx context.Context) ([]*WorkflowSchedule, error)
	RunScheduledWorkflow(ctx context.Context, ws *WorkflowSchedule) error
	ValidateSchedule(st ScheduleType, nextRunAt time.Time, isRunning bool) error
	ScheduleWorkflow(
		ctx context.Context,
		workflowID int32,
		scheduleType ScheduleType,
		scheduledDate time.Time,
	) error
	UpdateWorkflowSchedule(
		ctx context.Context,
		workflowID int32,
		scheduleType ScheduleType,
		scheduledDate time.Time,
	) error
	EnsureInFlightEnqueued()
}

type WorkflowService interface {
	VerifyWorkflowAccess(ctx context.Context, workflowID int32, userID string) error
	ValidateWorkflowGraph(nodes []ValidateNode, edges []ValidateEdge) error
	CreateWorkflow(
		ctx context.Context,
		userID string,
		name string,
		description string,
		status string,
		nodes []*WorkflowNodeDTO,
		edges []*WorkflowEdgeDTO,
	) (*WorkflowGraph, error)
	UpdateWorkflow(
		ctx context.Context,
		workflowID int32,
		name string,
		description string,
		nodes []*WorkflowNodeDTO,
		edges []*WorkflowEdgeDTO,
	) error
	ArchiveWorkflow(ctx context.Context, workflowID int32) error
}

type AccountService interface {
	DeleteUserData(ctx context.Context, userID string) error
}
