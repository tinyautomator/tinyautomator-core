package rabbitmq

import (
	"context"
	"fmt"

	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/sirupsen/logrus"
)

type RabbitMQClient interface {
	Publish(ctx context.Context, exchange, routingKey string, msg []byte) error
	Subscribe(
		ctx context.Context,
		queue string,
		routingKeys []string,
		handler func([]byte) error,
	) error
	Close() error
}

type rabbitMQClient struct {
	conn    *amqp.Connection
	channel *amqp.Channel
	logger  logrus.FieldLogger
}

func NewRabbitMQClient(url string, logger logrus.FieldLogger) (RabbitMQClient, error) {
	conn, err := amqp.Dial(url)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to RabbitMQ: %w", err)
	}

	ch, err := conn.Channel()
	if err != nil {
		conn.Close()
		return nil, fmt.Errorf("failed to open channel: %w", err)
	}

	err = ch.ExchangeDeclare(
		"workflow_tasks",
		"topic",
		true,  // durable
		false, // auto-deleted
		false, // internal
		false, // no-wait
		nil,
	)
	if err != nil {
		ch.Close()
		conn.Close()

		return nil, fmt.Errorf("failed to declare exchange: %w", err)
	}

	q, err := ch.QueueDeclare(
		"workflow_node_taskqueue",
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		logger.WithError(err).Fatal("failed to declare queue")
	}

	err = ch.QueueBind(
		q.Name,
		"node.schedule",
		"workflow_tasks",
		false,
		nil,
	)
	if err != nil {
		logger.WithError(err).Fatal("failed to bind queue")
	}

	returnChan := make(chan amqp.Return)
	ch.NotifyReturn(returnChan)

	go func() {
		for r := range returnChan {
			logger.WithFields(logrus.Fields{
				"reply_code":  r.ReplyCode,
				"reply_text":  r.ReplyText,
				"exchange":    r.Exchange,
				"routing_key": r.RoutingKey,
				"body":        string(r.Body),
			}).Warn("message was returned by broker")
		}

		logger.Info("rabbitmq return listener exited")
	}()

	errChan := make(chan *amqp.Error)
	ch.NotifyClose(errChan)

	go func() {
		for err := range errChan {
			logger.WithError(err).Error("RabbitMQ channel closed")
		}
	}()

	return &rabbitMQClient{
		conn:    conn,
		channel: ch,
		logger:  logger,
	}, nil
}

func (c *rabbitMQClient) Publish(
	ctx context.Context,
	exchange, routingKey string,
	msg []byte,
) error {
	if err := c.channel.PublishWithContext(ctx,
		exchange,
		routingKey,
		true,  // mandatory
		false, // immediate
		amqp.Publishing{
			ContentType: "application/json",
			// TODO: DeliveryMode: amqp.Persistent, // Make messages persistent
			Body: msg,
		}); err != nil {
		c.logger.WithError(err).Error("publish failed")
		return err
	}

	c.logger.WithFields(logrus.Fields{
		"exchange":    exchange,
		"routing_key": routingKey,
	}).Info("message published")

	return nil
}

func (c *rabbitMQClient) Subscribe(
	ctx context.Context,
	queue string,
	routingKeys []string,
	handler func([]byte) error,
) error {
	q, err := c.channel.QueueDeclare(
		queue, // name
		true,  // durable
		false, // delete when unused
		false, // exclusive
		false, // no-wait
		nil,   // arguments
	)
	if err != nil {
		return fmt.Errorf("failed to declare queue: %w", err)
	}

	// Bind to all routing keys
	for _, key := range routingKeys {
		err = c.channel.QueueBind(
			q.Name,
			key,
			"workflow_tasks",
			false,
			nil,
		)
		if err != nil {
			return fmt.Errorf("failed to bind queue to routing key %s: %w", key, err)
		}
	}

	msgs, err := c.channel.Consume(
		q.Name, // queue
		"",     // consumer
		false,  // auto-ack
		false,  // exclusive
		false,  // no-local
		false,  // no-wait
		nil,    // args
	)
	if err != nil {
		return fmt.Errorf("failed to register a consumer: %w", err)
	}

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

				if err := handler(msg.Body); err != nil {
					c.logger.WithError(err).Error("Failed to process message")
					msg.Nack(false, true)

					continue
				}

				msg.Ack(false)
			}
		}
	}()

	return nil
}

// DeclareExchange creates a new exchange if it doesn't exist
func (c *rabbitMQClient) DeclareExchange(name, kind string) error {
	return c.channel.ExchangeDeclare(
		name,  // name
		kind,  // type (e.g., "direct", "fanout", "topic")
		true,  // durable
		false, // auto-delete
		false, // internal
		false, // no-wait
		nil,   // arguments
	)
}

// DeclareQueue creates a new queue if it doesn't exist
func (c *rabbitMQClient) DeclareQueue(name string) (amqp.Queue, error) {
	return c.channel.QueueDeclare(
		name,  // name
		true,  // durable
		false, // delete when unused
		false, // exclusive
		false, // no-wait
		nil,   // arguments
	)
}

// BindQueue binds a queue to an exchange with a routing key
func (c *rabbitMQClient) BindQueue(queueName, exchangeName, routingKey string) error {
	return c.channel.QueueBind(
		queueName,    // queue name
		routingKey,   // routing key
		exchangeName, // exchange name
		false,        // no-wait
		nil,          // arguments
	)
}

func (c *rabbitMQClient) Close() error {
	if err := c.channel.Close(); err != nil {
		return fmt.Errorf("failed to close channel: %w", err)
	}

	if err := c.conn.Close(); err != nil {
		return fmt.Errorf("failed to close connection: %w", err)
	}

	return nil
}
