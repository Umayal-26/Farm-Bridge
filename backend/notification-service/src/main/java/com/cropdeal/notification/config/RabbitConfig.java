package com.cropdeal.notification.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {
    public static final String EXCHANGE = "crop.events";
    public static final String NOTIFY_QUEUE = "dealer.subscription.notifications";
    public static final String ROUTING_PATTERN = "crop.published.*";

    @Bean
    public TopicExchange cropExchange() {
        return new TopicExchange(EXCHANGE, true, false);
    }

    @Bean
    public Queue dealerQueue() {
        return QueueBuilder.durable(NOTIFY_QUEUE).build();
    }

    @Bean
    public Binding bindDealer(Queue dealerQueue, TopicExchange cropExchange) {
        return BindingBuilder.bind(dealerQueue).to(cropExchange).with(ROUTING_PATTERN);
    }

    @Bean
    public Jackson2JsonMessageConverter jsonConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory cf, Jackson2JsonMessageConverter converter) {
        RabbitTemplate tpl = new RabbitTemplate(cf);
        tpl.setMessageConverter(converter);
        return tpl;
    }
}
