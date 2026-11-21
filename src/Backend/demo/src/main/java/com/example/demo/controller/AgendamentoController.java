package com.example.demo.controller;

import com.example.demo.dto.AgendamentoRequestDTO;
import com.example.demo.dto.AgendamentoResponseDTO;
import com.example.demo.service.AgendamentoService;
import jakarta.validation.Valid;
import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/agendamentos")
public class AgendamentoController {
    private final AgendamentoService service;

    public AgendamentoController(AgendamentoService service) {
        this.service = service;
    }

    @GetMapping
    public List<AgendamentoResponseDTO> listar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        return service.listar(data).stream().map(AgendamentoResponseDTO::de).toList();
    }

    @GetMapping("/{id}")
    public AgendamentoResponseDTO buscar(@PathVariable Integer id) {
        return AgendamentoResponseDTO.de(service.buscar(id));
    }

    @PostMapping
    public ResponseEntity<AgendamentoResponseDTO> criar(@Valid @RequestBody AgendamentoRequestDTO request) {
        AgendamentoResponseDTO criado = AgendamentoResponseDTO.de(service.criar(request));
        return ResponseEntity.created(URI.create("/api/agendamentos/" + criado.idAgendamento())).body(criado);
    }

    @PutMapping("/{id}")
    public AgendamentoResponseDTO atualizar(@PathVariable Integer id,
            @Valid @RequestBody AgendamentoRequestDTO request) {
        return AgendamentoResponseDTO.de(service.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Integer id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
