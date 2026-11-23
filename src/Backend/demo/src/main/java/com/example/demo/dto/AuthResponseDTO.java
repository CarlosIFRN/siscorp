package com.example.demo.dto;

public record AuthResponseDTO(
        String accessToken,
        String tokenType,
        long expiresIn,
        UsuarioResponseDTO usuario
) {}
