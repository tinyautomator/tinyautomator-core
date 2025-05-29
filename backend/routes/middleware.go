package routes

import (
	"net/http"
	"strings"

	"github.com/clerk/clerk-sdk-go/v2/jwt"
	"github.com/clerk/clerk-sdk-go/v2/user"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
)

func authUser(ctx *gin.Context, logger logrus.FieldLogger) {
	var sessionToken string

	cookie, err := ctx.Cookie("__session")
	if err == nil && cookie != "" {
		sessionToken = cookie
	} else {
		sessionToken = strings.TrimPrefix(ctx.GetHeader("Authorization"), "Bearer ")
	}

	claims, err := jwt.Verify(ctx.Request.Context(), &jwt.VerifyParams{
		Token: sessionToken,
	})
	if err != nil {
		logger.WithError(err).
			WithField("session_token", sessionToken).
			Error("Failed to verify session")
		ctx.JSON(http.StatusUnauthorized, gin.H{
			"message": "Unauthorized",
		})
		ctx.Abort()

		return
	}

	usr, err := user.Get(ctx.Request.Context(), claims.Subject)
	if err != nil {
		logger.WithError(err).Error("Failed to get user")
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"message": "Internal server error",
		})
		ctx.Abort()

		return
	}

	ctx.Set("user", &models.User{ID: usr.ID})
}
