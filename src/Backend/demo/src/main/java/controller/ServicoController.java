package com.example.demo.controller;

import com.example.demo.model.Servico;
import com.example.demo.service.ServicoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/servicos")
public class ServicoController {

    private final ServicoService servicoService;

    public ServicoController(ServicoService servicoService) {
        this.servicoService = servicoService;
    }

    @GetMapping
    public List<Servico> listarServicosAtivos() {
        return servicoService.listarServicosAtivos();
    }

    @GetMapping("/empresa/{idEmpresa}")
    public List<Servico> listarServicosAtivosPorEmpresa(
            @PathVariable Integer idEmpresa) {
        return servicoService.listarServicosAtivosPorEmpresa(idEmpresa);
    }
}