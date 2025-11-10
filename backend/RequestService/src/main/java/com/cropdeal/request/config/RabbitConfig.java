// request-service/src/main/java/com/cropdeal/request/config/RabbitConfig.java
package com.cropdeal.request.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    public static final String PAYMENT_EXCHANGE = "payment.events";
    // base routing key (we'll bind with pattern)
    public static final String PAYMENT_ROUTE_COMPLETED = "payment.completed";
    public static final String PAYMENT_ROUTE_PATTERN = PAYMENT_ROUTE_COMPLETED + ".#";
    public static final String PAYMENT_QUEUE = "request.payment.completed.queue";

    @Bean
    public TopicExchange paymentExchange() {
        return new TopicExchange(PAYMENT_EXCHANGE, true, false);
    }

    @Bean
    public Queue paymentCompletedQueue() {
        return new Queue(PAYMENT_QUEUE, true);
    }

    @Bean
    public Binding paymentCompletedBinding(Queue paymentCompletedQueue, TopicExchange paymentExchange) {
        // Use pattern so keys like payment.completed or payment.completed.123 match
        return BindingBuilder.bind(paymentCompletedQueue)
                .to(paymentExchange)
                .with(PAYMENT_ROUTE_PATTERN);
    }

    @Bean
    public Jackson2JsonMessageConverter jackson2JsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
