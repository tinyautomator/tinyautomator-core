package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/tinyautomator/tinyautomator-core/backend/clients/google/gmail"
)

type GmailController interface {
	GetGmailAuthURL(ctx *gin.Context)
}

type gmailController struct {
}

var _ GmailController = (*gmailController)(nil)

func NewGmailController() GmailController {
	return &gmailController{}
}

func (c *gmailController) GetGmailAuthURL(ctx *gin.Context) {
	authURL := gmail.BuildAuthURL("devtest")

	ctx.JSON(http.StatusOK, gin.H{
		"url": authURL,
	})
}
