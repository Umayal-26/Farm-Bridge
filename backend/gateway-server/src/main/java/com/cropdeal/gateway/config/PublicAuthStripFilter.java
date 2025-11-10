package com.cropdeal.gateway.config;

import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;

@Configuration
public class PublicAuthStripFilter {

    private static final String[] PUBLIC_PATHS = {
            "/api/users/login",
            "/api/users/register",
            "/api/users/google-login",
            "/api/users/role-register"
    };

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE) 
    public GlobalFilter stripAuthorizationHeader() {
        return (exchange, chain) -> {
            String path = exchange.getRequest().getURI().getPath();
            for (String p : PUBLIC_PATHS) {
                if (path.startsWith(p)) {
                    var mutated = exchange.mutate()
                            .request(r -> r.headers(h -> h.remove("Authorization")))
                            .build();
                    return chain.filter(mutated);
                }
            }
            return chain.filter(exchange);
        };
    }
}
