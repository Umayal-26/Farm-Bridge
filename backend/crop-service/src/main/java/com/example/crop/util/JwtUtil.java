package com.example.crop.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.nio.charset.StandardCharsets;

@Component
public class JwtUtil {
    @Value("${app.jwt.secret}")
    private String secret;

    private SecretKey getKey() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        return new SecretKeySpec(keyBytes, "HmacSHA256");
    }

    private Claims parseInternal(String token) {
        try {
            String t = token == null ? "" : token.trim();
            if (t.startsWith("Bearer ")) t = t.substring(7);
            if (t.isBlank()) return null;

            return Jwts.parser()
                    .verifyWith(getKey())
                    .build()
                    .parseSignedClaims(t)
                    .getPayload();
        } catch (Exception ex) {
            return null; // invalid/expired -> let caller decide
        }
    }

    public Long extractUserId(String token) {
        Claims claims = parseInternal(token);
        if (claims == null) return null;
        Object id = claims.get("userId");
        if (id instanceof Integer) return ((Integer) id).longValue();
        if (id instanceof Long) return (Long) id;
        return (id != null) ? Long.valueOf(id.toString()) : null;
    }

    public String extractRole(String token) {
        Claims claims = parseInternal(token);
        if (claims == null) return null;
        Object role = claims.get("role");
        return role != null ? role.toString() : null;
    }

    public Long getUserId(String token) { return extractUserId(token); }
    public String getRole(String token) { return extractRole(token); }
}
