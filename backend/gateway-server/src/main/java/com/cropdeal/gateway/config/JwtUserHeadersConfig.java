package com.cropdeal.gateway.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.http.HttpHeaders;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

@Configuration
public class JwtUserHeadersConfig {

    // Must match User-service/app.jwt.secret
    private static final String SECRET = "umayal_cropdeal_secret_2025_secure_key_0987654321";

    private SecretKey getKey() {
        byte[] keyBytes = SECRET.getBytes(StandardCharsets.UTF_8);
        return new SecretKeySpec(keyBytes, "HmacSHA256");
    }

    @Bean
    public GlobalFilter jwtToUserHeadersFilter() {
        return (exchange, chain) -> {
            String auth = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (auth != null && auth.startsWith("Bearer ")) {
                try {
                    String token = auth.substring(7);
                    Claims claims = Jwts.parser().verifyWith(getKey()).build()
                            .parseSignedClaims(token).getPayload();

                    String role = claims.get("role", String.class);
                    Object uidObj = claims.get("userId");
                    String userId = uidObj == null ? null : String.valueOf(uidObj);

                    var mutated = exchange.mutate().request(r -> r.headers(h -> {
                        if (userId != null) h.set("X-User-Id", userId);
                        if (role != null)   h.set("X-User-Role", role);
                    })).build();

                    return chain.filter(mutated);
                } catch (Exception ignored) {
                    // If token cannot be parsed, forward as-is (public endpoints will still work)
                }
            }
            return chain.filter(exchange);
        };
    }
}
