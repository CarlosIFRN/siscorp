package com.example.demo.controller;

import org.springframework.context.annotation.Profile;

import com.example.demo.dto.UsuarioRequestDTO;
import com.example.demo.dto.UsuarioResponseDTO;
import com.example.demo.service.UsuarioService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Profile("memory")
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {
    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    @GetMapping
    public List<UsuarioResponseDTO> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public UsuarioResponseDTO buscar(@PathVariable Integer id) {
        return service.buscar(id);
    }

    @PostMapping
    public ResponseEntity<UsuarioResponseDTO> criar(
            @Validated(UsuarioRequestDTO.Criacao.class) @RequestBody UsuarioRequestDTO request) {
        UsuarioResponseDTO criado = service.criar(request);
        return ResponseEntity.created(URI.create("/api/usuarios/" + criado.id())).body(criado);
    }

    @PutMapping("/{id}")
    public UsuarioResponseDTO atualizar(@PathVariable Integer id, @Valid @RequestBody UsuarioRequestDTO request) {
        return service.atualizar(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desativar(@PathVariable Integer id) {
        service.desativar(id);
        return ResponseEntity.noContent().build();
    }
}
