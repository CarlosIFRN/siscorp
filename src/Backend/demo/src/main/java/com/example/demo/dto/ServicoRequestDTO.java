package com.example.demo.dto;

import com.example.demo.model.Servico;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record ServicoRequestDTO(
        @NotNull @Positive Integer idEmpresa,
        @NotBlank @Size(max = 100) String nomeServico,
        @NotNull @DecimalMin(value = "0.0", inclusive = false) @Digits(integer = 8, fraction = 2) BigDecimal valor,
        @NotNull @Positive Integer duracaoMinutos
) {
    public Servico toEntity() {
        Servico servico = new Servico();
        servico.setIdEmpresa(idEmpresa);
        servico.setNomeServico(nomeServico.trim());
        servico.setValor(valor);
        servico.setDuracaoMinutos(duracaoMinutos);
        return servico;
    }
}
