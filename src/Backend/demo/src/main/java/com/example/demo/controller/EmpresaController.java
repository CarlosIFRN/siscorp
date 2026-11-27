package com.example.demo.controller;

import com.example.demo.dto.EmpresaResponseDTO;
import com.example.demo.repository.EmpresaRepository;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/empresas")
public class EmpresaController {
    private final EmpresaRepository empresas;

    public EmpresaController(EmpresaRepository empresas) {
        this.empresas = empresas;
    }

    @GetMapping
    public List<EmpresaResponseDTO> listar() {
        return empresas.findAllByOrderByNomeEmpresaAsc().stream().map(EmpresaResponseDTO::de).toList();
    }
}
