package scheduler

import (
	"context"

	"github.com/tinyautomator/tinyautomator-core/backend/db/dao"
)

type WorkflowScheduler interface {
	Schedule(ctx context.Context, ws *dao.WorkflowSchedule) error
	Unschedule(scheduleID int64) error
	Start() error
	Shutdown() error
}
