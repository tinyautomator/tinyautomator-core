package rabbitmq

import (
	"context"
	"errors"
	"fmt"
	"math"
	"math/rand"
	"sync"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/sirupsen/logrus"
)

const (
	queue              = "process_node_run"
	retryExchange      = "retry_delayed_exchange"
	deadLetterExchange = "dlx_exchange"
	deadLetterQueue    = "process_node_run_dlq"

	// Retry configuration
	maxRetries        = 3
	initialDelayMs    = 2000   // 2 seconds in milliseconds
	maxDelayMs        = 120000 // 2 minutes in milliseconds
	backoffMultiplier = 2
)

type RabbitMQClient interface {
	Publish(ctx context.Context, msg []byte) error
	Subscribe(ctx context.Context, handler func([]byte) error) error
	StartReturnListener()
	Close() error
}

type rabbitMQClient struct {
	conn                    *amqp.Connection
	channel                 *amqp.Channel
	reconnectLock           sync.Mutex
	reconnecting            bool
	isConnected             bool
	logger                  logrus.FieldLogger
	ctx                     context.Context
	cancel                  context.CancelCauseFunc
	url                     string
	startReturnListenerLock sync.Mutex
	isListeningForReturns   bool
}

func NewRabbitMQClient(
	ctx context.Context,
	url string,
	logger logrus.FieldLogger,
) (RabbitMQClient, error) {
	ctx, cancel := context.WithCancelCause(ctx)

	c := &rabbitMQClient{
		ctx:    ctx,
		url:    url,
		logger: logger,
		cancel: cancel,
	}

	if err := c.connect(); err != nil {
		return nil, fmt.Errorf("failed to connect to rabbitmq: %w", err)
	}

	if err := c.setupQueuesAndExchanges(); err != nil {
		return nil, fmt.Errorf("failed to setup retry infrastructure: %w", err)
	}

	go c.monitorConnection()

	return c, nil
}

func (c *rabbitMQClient) setupQueuesAndExchanges() error {
	if err := c.channel.ExchangeDeclare(
		retryExchange,
		"x-delayed-message", // Special exchange type from plugin
		true,                // durable
		false,               // auto-delete
		false,               // internal
		false,               // no-wait
		amqp.Table{
			"x-delayed-type": "direct", // Underlying exchange type
		},
	); err != nil {
		return fmt.Errorf("failed to declare retry exchange: %w", err)
	}

	if err := c.channel.ExchangeDeclare(
		deadLetterExchange,
		"direct",
		true,  // durable
		false, // auto-delete
		false, // internal
		false, // no-wait
		nil,
	); err != nil {
		return fmt.Errorf("failed to declare dead letter exchange: %w", err)
	}

	if _, err := c.channel.QueueDeclare(
		deadLetterQueue,
		true,  // durable
		false, // auto-delete
		false, // exclusive
		false, // no-wait
		nil,
	); err != nil {
		return fmt.Errorf("failed to declare dead letter queue: %w", err)
	}

	if err := c.channel.QueueBind(
		deadLetterQueue,
		"failed", // routing key
		deadLetterExchange,
		false, // no-wait
		nil,
	); err != nil {
		return fmt.Errorf("failed to bind dead letter queue: %w", err)
	}

	if _, err := c.channel.QueueDeclare(
		queue,
		true,  // durable
		false, // auto-delete
		false, // exclusive
		false, // no-wait
		amqp.Table{
			"x-dead-letter-exchange":    deadLetterExchange,
			"x-dead-letter-routing-key": "failed",
		},
	); err != nil {
		return fmt.Errorf("failed to declare main queue: %w", err)
	}

	if err := c.channel.QueueBind(
		queue,
		"retry", // routing key for retries
		retryExchange,
		false, // no-wait
		nil,
	); err != nil {
		return fmt.Errorf("failed to bind retry exchange to main queue: %w", err)
	}

	return nil
}

func (c *rabbitMQClient) Publish(ctx context.Context, msg []byte) error {
	c.StartReturnListener()

	if err := c.channel.PublishWithContext(ctx,
		"",
		queue,
		true,  // mandatory
		false, // immediate
		amqp.Publishing{
			ContentType:  "application/json",
			DeliveryMode: amqp.Persistent,
			Body:         msg,
		}); err != nil {
		c.logger.WithError(err).Error("publish failed")
		return fmt.Errorf("failed to publish message: %w", err)
	}

	return nil
}

func (c *rabbitMQClient) Subscribe(ctx context.Context, handler func([]byte) error) error {
	if err := c.channel.Qos(
		100,   // prefetch count
		0,     // prefetch size
		false, // global
	); err != nil {
		return fmt.Errorf("failed to set qos: %w", err)
	}

	msgs, err := c.channel.Consume(
		queue,
		"",    // consumer
		false, // auto-ack
		false, // exclusive
		false, // no-local
		false, // no-wait
		nil,   // args
	)
	if err != nil {
		return fmt.Errorf("failed to register a consumer: %w", err)
	}

	semaphore := make(chan struct{}, 100)

	var wg sync.WaitGroup

	go func() {
		for {
			select {
			case <-ctx.Done():
				c.logger.Info("consumer context cancelled, stopping message processing")
				return
			case msg, ok := <-msgs:
				if !ok {
					c.logger.Info("message channel closed, stopping message processing")
					return
				}

				wg.Add(1)

				go func(delivery amqp.Delivery) {
					defer wg.Done()

					// Acquire semaphore
					semaphore <- struct{}{}
					defer func() { <-semaphore }()

					// Process message
					if err := handler(delivery.Body); err != nil {
						c.logger.WithError(err).Error("Failed to process message")
						c.handleFailedMessage(delivery)

						return
					}

					if err := delivery.Ack(false); err != nil {
						c.logger.WithError(err).Error("failed to ack message")
					}
				}(msg)
			}
		}
	}()

	return nil
}

func (c *rabbitMQClient) handleFailedMessage(msg amqp.Delivery) {
	retryCount := 0

	if msg.Headers != nil {
		if count, ok := msg.Headers["x-retry-count"]; ok {
			if countInt, ok := count.(int32); ok {
				retryCount = int(countInt)
			}
		}
	}

	c.logger.WithFields(logrus.Fields{
		"retry_count": retryCount,
		"max_retries": maxRetries,
	}).Info("handling failed message")

	if retryCount >= maxRetries {
		c.logger.WithField("retry_count", retryCount).Warn("max retries exceeded, sending to DLQ")

		if err := msg.Nack(false, false); err != nil {
			c.logger.WithError(err).Error("failed to nack message to DLQ")
		}

		return
	}

	delay := float64(initialDelayMs) * math.Pow(float64(backoffMultiplier), float64(retryCount))

	if delay > float64(maxDelayMs) {
		delay = float64(maxDelayMs)
	}

	c.logger.WithFields(logrus.Fields{
		"retry_count": retryCount + 1,
		"delay_ms":    int(delay),
	}).Info("scheduling retry")

	headers := amqp.Table{
		"x-retry-count": int32(retryCount + 1),
		"x-delay":       int32(delay),
	}

	if err := c.channel.PublishWithContext(context.Background(),
		retryExchange,
		"retry", // routing key
		false,   // mandatory
		false,   // immediate
		amqp.Publishing{
			ContentType:  msg.ContentType,
			DeliveryMode: msg.DeliveryMode,
			Headers:      headers,
			Body:         msg.Body,
		}); err != nil {
		c.logger.WithError(err).Error("failed to publish retry message")

		if err := msg.Nack(false, false); err != nil {
			c.logger.WithError(err).
				Error("failed to nack message to DLQ after retry publish failure")
		}

		return
	}

	if err := msg.Ack(false); err != nil {
		c.logger.WithError(err).Error("failed to ack original message after scheduling retry")
	}
}

func (c *rabbitMQClient) connect() error {
	select {
	case <-c.ctx.Done():
		c.logger.Info("ctx cancelled - cancelling connection attempt")
		return context.Canceled
	default:
	}

	c.reconnectLock.Lock()
	defer c.reconnectLock.Unlock()

	conn, err := amqp.Dial(c.url)
	if err != nil {
		return fmt.Errorf("failed to connect to rabbitmq: %w", err)
	}

	ch, err := conn.Channel()
	if err != nil {
		if err := conn.Close(); err != nil {
			return fmt.Errorf("failed to close connection: %w", err)
		}

		return fmt.Errorf("failed to open channel: %w", err)
	}

	c.conn = conn
	c.channel = ch
	c.isConnected = true
	c.isListeningForReturns = false
	c.logger.Info("successfully connected to rabbitmq")

	return nil
}

func (c *rabbitMQClient) monitorConnection() {
	c.reconnectLock.Lock()
	if c.reconnecting {
		c.reconnectLock.Unlock()
		return
	}

	c.reconnecting = true
	c.reconnectLock.Unlock()

	defer func() {
		c.reconnectLock.Lock()
		c.reconnecting = false
		c.reconnectLock.Unlock()
	}()

	closeChan := make(chan *amqp.Error, 1)
	c.conn.NotifyClose(closeChan)

	select {
	case amqpErr, ok := <-closeChan:
		if !ok || amqpErr == nil {
			return
		}

		c.reconnectLock.Lock()
		c.isConnected = false
		c.reconnectLock.Unlock()
		c.logger.WithError(amqpErr).Error("rabbitmq connection closed")

		c.attemptReconnect()

	case <-c.ctx.Done():
		c.logger.Info("connection monitoring stopped due to context cancellation")
		return
	}
}

func (c *rabbitMQClient) StartReturnListener() {
	c.startReturnListenerLock.Lock()
	defer c.startReturnListenerLock.Unlock()

	if c.isListeningForReturns {
		return
	}

	returnChan := make(chan amqp.Return, 1)
	c.channel.NotifyReturn(returnChan)

	go func() {
		for r := range returnChan {
			c.logger.WithFields(logrus.Fields{
				"reply_code":  r.ReplyCode,
				"reply_text":  r.ReplyText,
				"exchange":    r.Exchange,
				"routing_key": r.RoutingKey,
				"body":        string(r.Body),
			}).Warn("message was returned by broker")
		}

		c.logger.Info("rabbitmq return listener exited")
	}()

	c.isListeningForReturns = true
}

func (c *rabbitMQClient) attemptReconnect() {
	backoff := 1 * time.Second
	maxBackoff := 30 * time.Second

	jitter := func(d time.Duration) time.Duration {
		jitterFactor := 0.2
		jitterRange := float64(d) * jitterFactor

		return d + time.Duration(rand.Float64()*jitterRange)
	}

	attempts := 0
	maxAttempts := 10

	for {
		select {
		case <-c.ctx.Done():
			c.logger.Info("reconnection attempts cancelled")
			return
		default:
		}

		if attempts >= maxAttempts {
			c.logger.WithField("max_attempts", maxAttempts).
				Info("maximum reconnection attempts reached")
			c.cancel(errors.New("unable to reconnect to rabbitmq"))

			return
		}

		time.Sleep(jitter(backoff))

		c.logger.WithFields(logrus.Fields{
			"attempt": attempts + 1,
			"backoff": backoff,
		}).Info("attempting to reconnect to rabbitmq")

		if err := c.connect(); err != nil {
			c.logger.WithError(err).Error("failed to reconnect")

			attempts++
			backoff = min(time.Duration(1<<attempts)*time.Second, maxBackoff)

			continue
		}

		c.logger.Info("successfully reconnected to rabbitmq")

		if err := c.setupQueuesAndExchanges(); err != nil {
			c.logger.WithError(err).Error("failed to re-setup retry infrastructure after reconnect")
			continue
		}

		go c.monitorConnection()

		return
	}
}

func (c *rabbitMQClient) Close() error {
	c.reconnectLock.Lock()
	defer c.reconnectLock.Unlock()

	var closingErr error

	c.cancel(nil)

	if c.channel != nil {
		if err := c.channel.Close(); err != nil {
			closingErr = errors.Join(closingErr, fmt.Errorf("failed to close channel: %w", err))
		}
	}

	if c.conn != nil {
		if err := c.conn.Close(); err != nil {
			closingErr = errors.Join(closingErr, fmt.Errorf("failed to close connection: %w", err))
		}
	}

	if closingErr != nil {
		c.logger.WithError(closingErr).Error("failed to cleanly close rabbitmq client")
	}

	return closingErr
}
