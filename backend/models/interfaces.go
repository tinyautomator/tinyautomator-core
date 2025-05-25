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
	ClerkSecretKey     string        `envconfig:"CLERK_SECRET_KEY"`
	Port               string        `envconfig:"PORT"                    default:"9000"`
	WorkerPollInterval time.Duration `envconfig:"WORKER_POLLING_INTERVAL" default:"10m"`
	Env                string        `envconfig:"APPLICATION_ENV"         default:"development"`

	// Gmail Variables
	GmailClientID     string   `envconfig:"GMAIL_CLIENT_ID"`
	GmailClientSecret string   `envconfig:"GMAIL_CLIENT_SECRET"`
	GmailRedirectURL  string   `envconfig:"GMAIL_REDIRECT_URL"`
	GmailScopes       []string `envconfig:"GMAIL_SCOPES"`
	GmailOAuthConfig  *oauth2.Config

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

	GetWorkflowRepository() WorkflowRepository
	GetWorkflowScheduleRepository() WorkflowScheduleRepository
	GetWorkflowRunRepository() WorkflowRunRepository

	GetOrchestratorService() OrchestratorService
	GetExecutorService() ExecutorService
	GetSchedulerService() SchedulerService
	GetWorkflowService() WorkflowService

	GetGmailOAuthConfig() *oauth2.Config
	GetRedisClient() redis.RedisClient
	GetRabbitMQClient() rabbitmq.RabbitMQClient

	CleanUp()
}

type WorkflowRepository interface {
	GetWorkflow(ctx context.Context, id int32) (*Workflow, error)
	GetUserWorkflows(ctx context.Context, userID string) ([]*Workflow, error)
	GetChildNodeIDs(ctx context.Context, nodeID int32) ([]int32, error)
	CreateWorkflow(
		ctx context.Context,
		userID string,
		name string,
		description string,
		status string,
		nodes []*WorkflowNodeDTO,
		edges []*WorkflowEdgeDTO,
	) (*Workflow, error)
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
	CreateWorkflowRun(
		ctx context.Context,
		workflowID int32,
		nodeIDs []int32,
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
	UpdateNextRun(ctx context.Context, id int32, nextRunAt *int64, lastRunAt int64) error
	DeleteWorkflowScheduleByWorkflowID(ctx context.Context, workflowID int32) error
}

type OrchestratorService interface {
	OrchestrateWorkflow(ctx context.Context, workflowID int32) (int32, error)
}

type ExecutorService interface {
	ExecuteWorkflowNode(ctx context.Context, msg []byte) error
}

type SchedulerService interface {
	GetDueWorkflows(ctx context.Context) ([]*WorkflowSchedule, error)
	RunScheduledWorkflow(ctx context.Context, ws *WorkflowSchedule) error
	ScheduleWorkflow(ctx context.Context, workflowID int32) error
	EnsureInFlightEnqueued()
}

type WorkflowService interface {
	ValidateWorkflowGraph(nodes []ValidateNode, edges []ValidateEdge) error
	CreateWorkflow(
		ctx context.Context,
		userID string,
		name string,
		description string,
		status string,
		nodes []*WorkflowNodeDTO,
		edges []*WorkflowEdgeDTO,
	) (*Workflow, error)
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
