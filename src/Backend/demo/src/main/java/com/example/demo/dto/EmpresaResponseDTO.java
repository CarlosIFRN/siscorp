package com.example.demo.dto;

import com.example.demo.model.Empresa;

public record EmpresaResponseDTO(Integer id, String nome, String cnpj) {
    public static EmpresaResponseDTO de(Empresa empresa) {
        return new EmpresaResponseDTO(empresa.getIdEmpresa(), empresa.getNomeEmpresa(), empresa.getCnpj());
    }
}
