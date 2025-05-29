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
	recipients := input.Config["recipients"]
	subject := input.Config["subject"]
	body := input.Config["message"]

	h.logger.WithFields(logrus.Fields{
		"recipients": recipients,
		"subject":    subject,
		"body":       body,
	}).Info("sending email")

	return nil
}

func (h *SendEmailHandler) Validate(config ActionNodeInput) error {
	return nil
}

var _ ActionHandler = &SendEmailHandler{}
