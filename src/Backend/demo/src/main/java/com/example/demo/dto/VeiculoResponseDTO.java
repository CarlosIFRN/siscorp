package com.example.demo.dto;

import com.example.demo.model.TipoVeiculo;
import com.example.demo.model.Veiculo;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record VeiculoResponseDTO(
        @NotNull Integer idVeiculo,
        @NotBlank @Size(max = 10) String placa,
        @NotBlank @Size(max = 50) String marca,
        @NotBlank @Size(max = 80) String modelo,
        @Min(1886) Integer ano,
        @Size(max = 30) String cor,
        @NotNull TipoVeiculo tipoVeiculo,
        String observacoes,
        @NotNull Boolean ativo
) {
    public static VeiculoResponseDTO de(Veiculo veiculo) {
        return new VeiculoResponseDTO(
                veiculo.getIdVeiculo(),
                veiculo.getPlaca(),
                veiculo.getMarca(),
                veiculo.getModelo(),
                veiculo.getAno(),
                veiculo.getCor(),
                veiculo.getTipoVeiculo(),
                veiculo.getObservacoes(),
                veiculo.getAtivo()
        );
    }
}
