package com.example.demo.controller;

import org.springframework.context.annotation.Profile;

import com.example.demo.model.Servico;
import com.example.demo.service.ServicoService;
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
    public ResponseEntity<List<Servico>> listarAtivos(
            @PathVariable Integer idEmpresa) {

        return ResponseEntity.ok(
                service.listarAtivos(idEmpresa));
    }

    @GetMapping("/empresa/{idEmpresa}")
    public ResponseEntity<List<Servico>> listarTodos(
            @PathVariable Integer idEmpresa) {

        return ResponseEntity.ok(
                service.listarTodos(idEmpresa));
    }

    @PostMapping
    public ResponseEntity<Servico> cadastrar(
            @RequestBody Servico servico) {

        Servico criado = service.cadastrar(servico);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(criado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Servico> atualizar(
            @PathVariable Integer id,
            @RequestBody Servico servico) {

        return ResponseEntity.ok(
                service.atualizar(id, servico));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desativar(
            @PathVariable Integer id) {

        service.desativar(id);

        return ResponseEntity.noContent().build();
    }
}