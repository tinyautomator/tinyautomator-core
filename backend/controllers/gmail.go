package controllers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/tinyautomator/tinyautomator-core/backend/clients/google/gmail"
	"golang.org/x/oauth2"
)

type GmailController interface {
	GetGmailAuthURL(ctx *gin.Context)
	HandleCallBack(ctx *gin.Context)
	SendEmail(ctx *gin.Context)
}

type gmailController struct {
}

var _ GmailController = (*gmailController)(nil)

func NewGmailController() GmailController {
	return &gmailController{}
}

func (c *gmailController) GetGmailAuthURL(ctx *gin.Context) {
	// TODO : Introduce a random state for each request for security purposes
	authURL := gmail.BuildAuthURL("devtest")

	ctx.JSON(http.StatusOK, gin.H{
		"url": authURL,
	})
}

func (c *gmailController) HandleCallBack(ctx *gin.Context) {
	code := ctx.Query("code")

	if code == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Missing code"})
		return
	}

	token, err := gmail.ExchangeCodeForToken(ctx, code)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Token exchange failed", "details": err.Error()})
		return
	}

	// SendEmail requires a "from" tag with users email or valid alias so unsure if we need this or not
	email, err := gmail.GetUserEmail(ctx, token)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch user email", "details": err.Error()})
		return
	}

	// TODO: Save token (email ???, access_token, refresh_token, expiry) to DB for userID

	// 🧪 TEMP: Return token directly so you can plug it into test APIs
	ctx.JSON(http.StatusOK, gin.H{
		"access_token":  token.AccessToken,
		"refresh_token": token.RefreshToken,
		"expiry":        token.Expiry,
		"token_type":    token.TokenType,
		"scope":         token.Extra("scope"), // if present
		"email":         email,
	})
}

func (c *gmailController) SendEmail(ctx *gin.Context) {
	var req struct {
		AccessToken  string `json:"access_token" binding:"required"`
		RefreshToken string `json:"refresh_token" binding:"required"`
		Expiry       string `json:"expiry" binding:"required"`
		To           string `json:"to" binding:"required"`
		From         string `json:"from" binding:"required"`
		Subject      string `json:"subject" binding:"required"`
		Body         string `json:"body" binding:"required"`
	}

	err := ctx.ShouldBindBodyWithJSON(&req)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid request", "details": err.Error()})
	}

	expiryTime, err := time.Parse(time.RFC3339Nano, req.Expiry)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid expiry format"})
		return
	}

	token := &oauth2.Token{
		AccessToken:  req.AccessToken,
		RefreshToken: req.RefreshToken,
		Expiry:       expiryTime,
		TokenType:    "Bearer",
	}

	encoded, err := gmail.EncodeSimpleText(req.To, req.From, req.Subject, req.Body)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to encode email", "details": err.Error()})
		return
	}

	err = gmail.SendRawEmail(ctx, token, encoded)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to send email", "details": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Email sent successfully!"})
}
