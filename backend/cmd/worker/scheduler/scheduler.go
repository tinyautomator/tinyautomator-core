package scheduler

import "github.com/tinyautomator/tinyautomator-core/backend/db/dao"

type WorkflowScheduler interface {
	Schedule(schedule *dao.WorkflowSchedule) error
	Unschedule(scheduleID int64) error
	Start() error
	Shutdown() error
}
