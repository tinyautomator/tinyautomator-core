// TODO: Finish adding base functionality for the time trigger service

package timetrigger

import (
	"github.com/tinyautomator/tinyautomator-core/backend/repositories/timetrigger"
)

type Service struct {
	repo timetrigger.Repository
}
func NewService(repo timetrigger.Repository) *Service {
	return &Service{
		repo: repo,
	}
}

// func (s *Service) ExecuteTriggers() error {
	// triggers, err := s.repo.FetchDueTriggers()
	// if err != nil {
	// 	return err
	// }
	// for _, trigger := range triggers {
	// 	if (isTriggerDue()) {
	// 		// Execute the trigger
	// 	}
	// }
// }

// func isTriggerDue() bool {
	// Check if the trigger is due based on its schedule
	// This is a placeholder implementation.
	// return true
// }
