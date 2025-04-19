package worker

import (
	"github.com/go-co-op/gocron/v2"
	"github.com/sirupsen/logrus"
)

type gocronLoggerAdapter struct {
	Logger logrus.FieldLogger
}

var _ gocron.Logger = (*gocronLoggerAdapter)(nil)

func NewGoCronLoggerAdapter(logger logrus.FieldLogger) *gocronLoggerAdapter {
	return &gocronLoggerAdapter{
		Logger: logger,
	}
}

func (l *gocronLoggerAdapter) Debug(msg string, args ...any) {
	l.Logger.WithFields(toLogrusFields(args...)).Debug(msg)
}

func (l *gocronLoggerAdapter) Info(msg string, args ...any) {
	l.Logger.WithFields(toLogrusFields(args...)).Info(msg)
}

func (l *gocronLoggerAdapter) Warn(msg string, args ...any) {
	l.Logger.WithFields(toLogrusFields(args...)).Warn(msg)
}

func (l *gocronLoggerAdapter) Error(msg string, args ...any) {
	l.Logger.WithFields(toLogrusFields(args...)).Error(msg)
}

// toLogrusFields converts flat key/value pairs into logrus.Fields
func toLogrusFields(args ...any) logrus.Fields {
	fields := logrus.Fields{}

	if len(args)%2 != 0 {
		fields["malformed_log_args"] = args
		return fields
	}

	for i := 0; i < len(args); i += 2 {
		key, ok := args[i].(string)
		if !ok {
			key = "invalid_key"
		}

		fields[key] = args[i+1]
	}

	return fields
}
