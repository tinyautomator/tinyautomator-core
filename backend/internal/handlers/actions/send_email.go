package handlers

import (
	"context"

	"github.com/sirupsen/logrus"
)

type SendEmailHandler struct {
	logger logrus.FieldLogger
}

func NewSendEmailHandler(logger logrus.FieldLogger) ActionHandler {
	return &SendEmailHandler{
		logger: logger,
	}
}

func (h *SendEmailHandler) Execute(ctx context.Context, input ActionNodeInput) error {
	email := input.Config["email"].(string)
	subject := input.Config["subject"].(string)
	body := input.Config["body"].(string)

	h.logger.WithFields(logrus.Fields{
		"email":   email,
		"subject": subject,
		"body":    body,
	}).Info("sending email")

	return nil
}

func (h *SendEmailHandler) Validate(config ActionNodeInput) error {
	return nil
}

var _ ActionHandler = &SendEmailHandler{}
