package clerk

import (
	"context"

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/clerk/clerk-sdk-go/v2/user"
)

func GetUser(ctx context.Context, userID string) (*clerk.User, error) {
	return user.Get(ctx, userID)
}
