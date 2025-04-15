package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/tinyautomator/tinyautomator-core/backend/clients/google/gmail"
)

func GetGmailAuthURL(c *gin.Context) {
	url := gmail.BuildAuthURL("devtest")
	c.JSON(http.StatusOK, gin.H{"url": url})
}
