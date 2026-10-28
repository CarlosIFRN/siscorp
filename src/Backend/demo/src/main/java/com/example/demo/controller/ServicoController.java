package com.example.demo.controller;

import com.example.demo.model.Servico;
import com.example.demo.service.ServicoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/servicos")
public class ServicoController {

    private final ServicoService service;

    public ServicoController(ServicoService service) {
        this.service = service;
    }

    // Lista somente serviços ativos
    @GetMapping("/ativos/{idEmpresa}")
    public ResponseEntity<List<Servico>> listarAtivos(
            @PathVariable Integer idEmpresa) {

        return ResponseEntity.ok(
                service.listarAtivos(idEmpresa));
    }

    // Lista todos os serviços de uma empresa
    @GetMapping("/empresa/{idEmpresa}")
    public ResponseEntity<List<Servico>> listarTodos(
            @PathVariable Integer idEmpresa) {

        return ResponseEntity.ok(
                service.listarTodos(idEmpresa));
    }

    // Cadastra um serviço
    @PostMapping
    public ResponseEntity<Servico> cadastrar(
            @RequestBody Servico servico) {

        Servico criado = service.cadastrar(servico);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(criado);
    }

    // Atualiza um serviço
    @PutMapping("/{id}")
    public ResponseEntity<Servico> atualizar(
            @PathVariable Integer id,
            @RequestBody Servico servico) {

        return ResponseEntity.ok(
                service.atualizar(id, servico));
    }

    // Desativa um serviço
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desativar(
            @PathVariable Integer id) {

        service.desativar(id);

        return ResponseEntity.noContent().build();
    }
}