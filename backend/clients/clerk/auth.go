package clerk

import (
	"context"
	"fmt"

	"github.com/clerk/clerk-sdk-go/v2/user"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
)

func GetUser(ctx context.Context, userID string) (*models.User, error) {
	if clerkUser, err := user.Get(ctx, userID); err != nil {
		return nil, fmt.Errorf("clerk failed to get user %v: %w", userID, err)
	} else {
		user := &models.User{
			ID:           clerkUser.ID,
			FirstName:    clerkUser.FirstName,
			LastName:     clerkUser.LastName,
			EmailAddress: clerkUser.PrimaryEmailAddressID,
		}

		return user, nil
	}
}
