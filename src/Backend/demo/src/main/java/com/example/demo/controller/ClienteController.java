package com.example.demo.controller;

import com.example.demo.dto.ClienteRequestDTO;
import com.example.demo.dto.ClienteResponseDTO;
import com.example.demo.service.ClienteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @GetMapping
    public ResponseEntity<List<ClienteResponseDTO>> listarTodos() {
        return ResponseEntity.ok(clienteService.listarTodos().stream()
                .map(ClienteResponseDTO::de)
                .toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClienteResponseDTO> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(ClienteResponseDTO.de(clienteService.buscarPorId(id)));
    }

    @PostMapping
    public ResponseEntity<ClienteResponseDTO> cadastrar(@Valid @RequestBody ClienteRequestDTO request) {
        ClienteResponseDTO novoCliente = ClienteResponseDTO.de(
                clienteService.cadastrar(request.toEntity()));

        return ResponseEntity.status(HttpStatus.CREATED).body(novoCliente);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClienteResponseDTO> atualizar(
            @PathVariable Integer id,
            @Valid @RequestBody ClienteRequestDTO request
    ) {
        return ResponseEntity.ok(
                ClienteResponseDTO.de(clienteService.atualizar(id, request.toEntity())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Integer id) {
        clienteService.excluir(id);

        return ResponseEntity.noContent().build();
    }
}