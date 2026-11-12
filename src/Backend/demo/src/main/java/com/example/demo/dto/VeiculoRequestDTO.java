package com.example.demo.dto;

import com.example.demo.model.TipoVeiculo;
import com.example.demo.model.Veiculo;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record VeiculoRequestDTO(
        @NotBlank @Size(max = 10) String placa,
        @NotBlank @Size(max = 50) String marca,
        @NotBlank @Size(max = 80) String modelo,
        @Min(1886) Integer ano,
        @Size(max = 30) String cor,
        @NotNull TipoVeiculo tipoVeiculo,
        String observacoes
) {
    public Veiculo toEntity() {
        Veiculo veiculo = new Veiculo();
        veiculo.setPlaca(placa.trim());
        veiculo.setMarca(marca.trim());
        veiculo.setModelo(modelo.trim());
        veiculo.setAno(ano);
        veiculo.setCor(cor == null ? null : cor.trim());
        veiculo.setTipoVeiculo(tipoVeiculo);
        veiculo.setObservacoes(observacoes);
        return veiculo;
    }
}
