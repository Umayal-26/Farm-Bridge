package com.example.crop.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntime(RuntimeException ex) {
        String msg = ex.getMessage() == null ? "Bad request" : ex.getMessage();
        HttpStatus status;

        String lower = msg.toLowerCase();
        if (lower.contains("token") || lower.contains("unauthorized") || lower.contains("authorization")) {
            status = HttpStatus.UNAUTHORIZED; // 401
        } else if (lower.contains("not found") || lower.contains("missing") || lower.contains("invalid")) {
            status = HttpStatus.BAD_REQUEST; // 400
        } else {
            status = HttpStatus.BAD_REQUEST; // default 400 for Runtime
        }

        return ResponseEntity.status(status).body(
            Map.of("timestamp", Instant.now().toString(),
                   "error", msg)
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleAny(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
            Map.of("timestamp", Instant.now().toString(),
                   "error", "Internal server error")
        );
    }
}
