package com.example.demo.dto;

import com.example.demo.model.Servico;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record ServicoResponseDTO(
        @NotNull Integer idServico,
        @NotNull @Positive Integer idEmpresa,
        @NotBlank @Size(max = 100) String nomeServico,
        @NotNull @DecimalMin(value = "0.0", inclusive = false) @Digits(integer = 8, fraction = 2) BigDecimal valor,
        @NotNull @Positive Integer duracaoMinutos,
        @NotNull Boolean ativo
) {
    public static ServicoResponseDTO de(Servico servico) {
        return new ServicoResponseDTO(
                servico.getIdServico(),
                servico.getIdEmpresa(),
                servico.getNomeServico(),
                servico.getValor(),
                servico.getDuracaoMinutos(),
                servico.getAtivo()
        );
    }
}
