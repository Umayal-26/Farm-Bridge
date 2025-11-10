package com.example.usermanagement.entity;
import com.example.usermanagement.enums.Role;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    @Column(unique = true, nullable = false)
    private String email;
    private String password;
    @Enumerated(EnumType.STRING)
    private Role role;
    private String provider;   // LOCAL or GOOGLE
    private String providerId; // Google sub
    private boolean enabled = true;
}
