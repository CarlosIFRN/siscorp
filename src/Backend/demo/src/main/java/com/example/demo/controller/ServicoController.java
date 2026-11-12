package com.example.demo.controller;

import org.springframework.context.annotation.Profile;

import com.example.demo.dto.ServicoRequestDTO;
import com.example.demo.dto.ServicoResponseDTO;
import com.example.demo.service.ServicoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Profile("db")
@RestController
@RequestMapping("/api/servicos")
public class ServicoController {

    private final ServicoService service;

    public ServicoController(ServicoService service) {
        this.service = service;
    }

    @GetMapping("/ativos/{idEmpresa}")
    public ResponseEntity<List<ServicoResponseDTO>> listarAtivos(
            @PathVariable Integer idEmpresa) {

        return ResponseEntity.ok(
                service.listarAtivos(idEmpresa).stream()
                        .map(ServicoResponseDTO::de)
                        .toList());
    }

    @GetMapping("/empresa/{idEmpresa}")
    public ResponseEntity<List<ServicoResponseDTO>> listarTodos(
            @PathVariable Integer idEmpresa) {

        return ResponseEntity.ok(
                service.listarTodos(idEmpresa).stream()
                        .map(ServicoResponseDTO::de)
                        .toList());
    }

    @PostMapping
    public ResponseEntity<ServicoResponseDTO> cadastrar(
            @Valid @RequestBody ServicoRequestDTO request) {

        ServicoResponseDTO criado = ServicoResponseDTO.de(
                service.cadastrar(request.toEntity()));

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(criado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServicoResponseDTO> atualizar(
            @PathVariable Integer id,
            @Valid @RequestBody ServicoRequestDTO request) {

        return ResponseEntity.ok(ServicoResponseDTO.de(
                service.atualizar(id, request.toEntity())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desativar(
            @PathVariable Integer id) {

        service.desativar(id);

        return ResponseEntity.noContent().build();
    }
}