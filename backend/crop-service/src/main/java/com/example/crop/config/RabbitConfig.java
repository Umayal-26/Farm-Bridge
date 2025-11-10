package com.example.crop.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    public static final String CROP_EXCHANGE = "crop.events";
    public static final String CROP_REQUEST_QUEUE = "crop-request";

    @Bean
    public Queue cropRequestQueue() {
        return QueueBuilder.durable(CROP_REQUEST_QUEUE).build();
    }

    @Bean
    public TopicExchange cropExchange() {
        return new TopicExchange(CROP_EXCHANGE, true, false);
    }

    @Bean
    public Binding cropRequestBinding(Queue cropRequestQueue, TopicExchange cropExchange) {
        return BindingBuilder.bind(cropRequestQueue).to(cropExchange).with("crop.requested.#");
    }

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory factory, Jackson2JsonMessageConverter converter) {
        RabbitTemplate template = new RabbitTemplate(factory);
        template.setMessageConverter(converter);
        return template;
    }
}
