package com.cropdeal.payment.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntime(RuntimeException ex) {
        ex.printStackTrace(); // show cause in console
        return ResponseEntity.badRequest().body(
            Map.of("timestamp", Instant.now().toString(), "error", ex.getMessage())
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleAny(Exception ex) {
        ex.printStackTrace(); // show full stack trace in console
        return ResponseEntity.internalServerError().body(
            Map.of("timestamp", Instant.now().toString(), "error", ex.getMessage())
        );
    }
}
