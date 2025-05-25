package controllers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/tinyautomator/tinyautomator-core/backend/clients/google"
	"github.com/tinyautomator/tinyautomator-core/backend/models"
	"golang.org/x/oauth2"
)

type GmailController interface {
	GetGmailAuthURL(ctx *gin.Context)
	HandleCallBack(ctx *gin.Context)
	SendEmail(ctx *gin.Context)
}

type gmailController struct {
	gmailOAuthConfig *oauth2.Config
}

func NewGmailController(cfg models.AppConfig) GmailController {
	return &gmailController{
		gmailOAuthConfig: cfg.GetGmailOAuthConfig(),
	}
}

func (c *gmailController) GetGmailAuthURL(ctx *gin.Context) {
	// TODO : Introduce a random state for each request for security purposes
	authURL := c.gmailOAuthConfig.AuthCodeURL(
		"devtest",
		oauth2.AccessTypeOffline,
		oauth2.SetAuthURLParam("prompt", "consent"),
	)
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

	token, err := c.gmailOAuthConfig.Exchange(ctx, code)
	if err != nil {
		ctx.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Token exchange failed", "details": err.Error()},
		)

		return
	}

	// SendEmail requires a "from" tag with users email or valid alias so unsure if we need this or not
	email, err := google.GetUserEmail(ctx, token, c.gmailOAuthConfig)
	if err != nil {
		ctx.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "Could not fetch user email", "details": err.Error()},
		)

		return
	}

	// TODO: Save token (email ???, access_token, refresh_token, expiry) to DB for userID

	// TEMP: saving as a cookie
	tokenData := struct {
		AccessToken  string `json:"access_token"`
		RefreshToken string `json:"refresh_token"`
		Expiry       string `json:"expiry"`
		Email        string `json:"email"`
	}{
		AccessToken:  token.AccessToken,
		RefreshToken: token.RefreshToken,
		Expiry:       token.Expiry.Format(time.RFC3339),
		Email:        email,
	}

	tokenJSON, err := json.Marshal(tokenData)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to encode token"})
		return
	}

	// Set cookie with token data
	ctx.SetCookie(
		"gmail_token",
		string(tokenJSON),
		3600*24*180, // 6 months
		"/",
		"localhost", // domain explicitly set to localhost
		false,       // secure: false for local dev!
		false,       // httpOnly : false for debugging, set to true for production
	)
	// Return HTML that will close the popup window
	ctx.Header("Content-Type", "text/html")
	ctx.String(http.StatusOK, `
    	<html>
    	    <body>
    	        <script>
    	            window.close();
    	        </script>
    	    </body>
    	</html>
	`)
}

func (c *gmailController) SendEmail(ctx *gin.Context) {
	// Get token from cookie
	tokenJSON, err := ctx.Cookie("gmail_token")
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Gmail account not connected"})
		return
	}

	var tokenData struct {
		AccessToken  string `json:"access_token"`
		RefreshToken string `json:"refresh_token"`
		Expiry       string `json:"expiry"`
		Email        string `json:"email"`
	}

	if err := json.Unmarshal([]byte(tokenJSON), &tokenData); err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token data"})
		return
	}

	expiryTime, err := time.Parse(time.RFC3339, tokenData.Expiry)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid expiry format"})
		return
	}

	token := &oauth2.Token{
		AccessToken:  tokenData.AccessToken,
		RefreshToken: tokenData.RefreshToken,
		Expiry:       expiryTime,
		TokenType:    "Bearer",
	}

	var req struct {
		To      string `json:"to" binding:"required"`
		Subject string `json:"subject" binding:"required"`
		Body    string `json:"body" binding:"required"`
	}

	if err := ctx.ShouldBindBodyWithJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid request", "details": err.Error()})
	}

	encoded, err := google.EncodeSimpleText(req.To, tokenData.Email, req.Subject, req.Body)
	if err != nil {
		ctx.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "failed to encode email", "details": err.Error()},
		)

		return
	}

	err = google.SendRawEmail(ctx, token, c.gmailOAuthConfig, encoded)
	if err != nil {
		ctx.JSON(
			http.StatusInternalServerError,
			gin.H{"error": "failed to send email", "details": err.Error()},
		)

		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Email sent successfully!"})
}

var _ GmailController = (*gmailController)(nil)
