package com.cropdeal.payment.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    public static final String PAYMENT_EXCHANGE = "payment.events";
    public static final String PAYMENT_QUEUE = "payment-completed";

    /**
     * Routing key base for completed payments.
     * We use two forms:
     *  - PAYMENT_ROUTE_COMPLETED -> base routing key ("payment.completed")
     *  - PAYMENT_ROUTE_PATTERN   -> binding pattern ("payment.completed.#") so consumers can bind to any suffix
     */
    public static final String PAYMENT_ROUTE_COMPLETED = "payment.completed";
    public static final String PAYMENT_ROUTE_PATTERN = PAYMENT_ROUTE_COMPLETED + ".#";

    @Bean
    public Queue paymentQueue() {
        return QueueBuilder.durable(PAYMENT_QUEUE).build();
    }

    @Bean
    public TopicExchange paymentExchange() {
        return new TopicExchange(PAYMENT_EXCHANGE, true, false);
    }

    @Bean
    public Binding paymentBinding(Queue paymentQueue, TopicExchange paymentExchange) {
        // Bind queue to exchange using pattern so routing keys like payment.completed or payment.completed.123 match
        return BindingBuilder.bind(paymentQueue).to(paymentExchange).with(PAYMENT_ROUTE_PATTERN);
    }

    @Bean
    public Jackson2JsonMessageConverter jsonConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory factory, Jackson2JsonMessageConverter converter) {
        RabbitTemplate template = new RabbitTemplate(factory);
        template.setMessageConverter(converter);
        return template;
    }
}
