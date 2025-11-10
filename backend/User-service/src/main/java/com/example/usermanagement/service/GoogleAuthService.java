package com.example.usermanagement.service;

import com.example.usermanagement.entity.User;
import com.example.usermanagement.enums.Role;
import com.example.usermanagement.repository.UserRepository;
import com.example.usermanagement.util.JwtUtil;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Map;

@Service
public class GoogleAuthService {

    private final UserRepository repo;
    private final JwtUtil jwtUtil;
    private final GoogleIdTokenVerifier verifier;

    public GoogleAuthService(UserRepository repo,
                             JwtUtil jwtUtil,
                             @Value("${google.clientId}") String clientId) throws Exception {
        this.repo = repo;
        this.jwtUtil = jwtUtil;

        this.verifier = new GoogleIdTokenVerifier.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance()
        )
        .setAudience(Collections.singletonList(clientId))
        .build();

        System.out.println("✅ GoogleAuthService initialized with Client ID: " + clientId);
    }

    public Map<String, Object> verifyAndAuthenticate(String idTokenString) throws Exception {
        GoogleIdToken idToken = verifier.verify(idTokenString);
        if (idToken == null) throw new Exception("Invalid Google token");

        var payload = idToken.getPayload();
        String email = payload.getEmail();
        String name = (String) payload.get("name");
        String sub = payload.getSubject();

        User user = repo.findByProviderId(sub).orElseGet(() ->
                repo.findByEmail(email).orElse(null)
        );

        if (user == null) {
            // 🟡 New Google user — front-end will show Select Role
            return Map.of("status", 202, "email", email, "name", name, "sub", sub);
        }

        String token = jwtUtil.generateToken(user);
        return Map.of(
                "token", token,
                "role", user.getRole().name(),
                "userId", user.getId(),
                "email", user.getEmail()
        );
    }

    public Map<String, Object> registerGoogleUser(String email, String name, Role role, String providerId) {
        User user = User.builder()
                .email(email)
                .name(name != null ? name : email)
                .role(role != null ? role : Role.FARMER)
                .provider("GOOGLE")
                .providerId(providerId)
                .enabled(true)
                .password("{noop}OAUTH2_USER")
                .build();

        repo.save(user);
        String token = jwtUtil.generateToken(user);

        return Map.of(
            "token", token,
            "role", user.getRole().name(),
            "userId", user.getId(),
            "email", user.getEmail()
        );
    }
}
