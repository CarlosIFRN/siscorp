package com.example.demo.controller;

import com.example.demo.dto.UsuarioResponseDTO;
import com.example.demo.repository.UsuarioRepository;
import java.security.Principal;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UsuarioRepository repository;

    public AuthController(UsuarioRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/me")
    public UsuarioResponseDTO me(Principal principal) {
        return repository.findByEmailUsuario(principal.getName())
                .map(UsuarioResponseDTO::de)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }
}
