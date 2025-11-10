package com.example.usermanagement.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Configuration
public class HttpHeadersConfig {

    @Bean
    public OncePerRequestFilter coopFilter() {
        return new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(HttpServletRequest request,
                                            HttpServletResponse response,
                                            FilterChain filterChain)
                    throws ServletException, IOException {

                // ✅ This allows OAuth popups to communicate back to your app
                response.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");

                // (Optional but recommended)
                response.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");

                filterChain.doFilter(request, response);
            }
        };
    }
}
