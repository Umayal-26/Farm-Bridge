package com.cropdeal.payment.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String secret;

    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    private Claims parseInternal(String token) {
        String t = token.startsWith("Bearer ") ? token.substring(7) : token;
        return Jwts.parser() // ✅ For 0.12.x we use Jwts.parser() via factory below
                .verifyWith(getKey()) // replaces setSigningKey()
                .build()
                .parseSignedClaims(t)
                .getPayload();
    }

    public Long extractUserId(String token) {
        Object id = parseInternal(token).get("userId");
        if (id instanceof Integer) return ((Integer) id).longValue();
        if (id instanceof Long) return (Long) id;
        return id != null ? Long.valueOf(id.toString()) : null;
    }

    public String extractRole(String token) {
        Object role = parseInternal(token).get("role");
        return role != null ? role.toString() : null;
    }
}
