package com.example.usermanagement.controller;

import com.example.usermanagement.entity.User;
import com.example.usermanagement.enums.Role;
import com.example.usermanagement.repository.UserRepository;
import com.example.usermanagement.service.GoogleAuthService;
import com.example.usermanagement.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;
    private final GoogleAuthService googleAuthService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (user.getEmail() == null || user.getPassword() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and password required"));
        }

        if (repo.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Email already exists"));
        }
        if (user.getRole() == null) {
            user.setRole(Role.FARMER);
        }
        user.setPassword(encoder.encode(user.getPassword()));
        user.setProvider("LOCAL");
        user.setEnabled(true);
        User saved = repo.save(user);

        String token = jwtUtil.generateToken(saved);
        return ResponseEntity.ok(Map.of(
                "message", "Registered successfully",
                "token", token,
                "role", saved.getRole().name(),
                "userId", saved.getId(),
                "email", saved.getEmail()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> payload) {
        String email = payload != null ? payload.get("email") : null;
        String password = payload != null ? payload.get("password") : null;

        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and password are required"));
        }

        Optional<User> maybe = repo.findByEmail(email);
        if (maybe.isEmpty()) {
            // 401 unauthorized — don't reveal whether user exists or not in production, but helpful for dev
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid credentials"));
        }
        User user = maybe.get();

        if (user.getPassword() == null || !encoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid credentials"));
        }

        String token = jwtUtil.generateToken(user);
        return ResponseEntity.ok(Map.of(
                "token", token,
                "role", user.getRole() != null ? user.getRole().name() : "FARMER",
                "userId", user.getId(),
                "email", user.getEmail()
        ));
    }

    // ✅ Angular posts { "idToken": "<Google credential>" }
    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> body) {
        try {
            String idToken = body.get("idToken");
            if (idToken == null || idToken.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing Google token"));
            }
            var result = googleAuthService.verifyAndAuthenticate(idToken);

            if (result.containsKey("status") && result.get("status").equals(202)) {
                return ResponseEntity.status(202).body(result);
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/role-register")
    public ResponseEntity<?> registerRole(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            String name = body.get("name");
            String roleStr = body.get("role");
            String providerId = body.get("sub");

            if (email == null || name == null || roleStr == null || providerId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing required fields"));
            }

            Role role = Role.valueOf(roleStr.toUpperCase());
            var result = googleAuthService.registerGoogleUser(email, name, role, providerId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/all")
    public List<User> getAllUsers() {
        return repo.findAll();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        repo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User deleted"));
    }

}
