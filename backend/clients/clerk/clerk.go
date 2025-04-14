package clerk

import (
	"context"

	"github.com/clerk/clerk-sdk-go/v2/user"
)

type User struct {
	ID           string
	FirstName    *string
	LastName     *string
	EmailAddress *string
}

func GetUser(ctx context.Context, userID string) User {
	clerkUser, _ := user.Get(ctx, userID)
	return User{
		ID:           clerkUser.ID,
		FirstName:    clerkUser.FirstName,
		LastName:     clerkUser.LastName,
		EmailAddress: clerkUser.PrimaryEmailAddressID,
	}
}

// type UserClient interface {
// 	GetUser(context.Context, string) User
// }

// type userClient struct {}

// func NewUserClient() UserClient {
// 	return userClient{}
// }

// func (u userClient) GetUser(ctx context.Context, userID string) User {
// 	clerkUser, _ := user.Get(ctx, userID)
// 	return User{
// 		ID: clerkUser.ID,
// 		FirstName: clerkUser.FirstName,
// 		LastName: clerkUser.LastName,
// 		EmailAddress: clerkUser.PrimaryEmailAddressID,
// 	}
// }

// var _ UserClient = userClient{}
