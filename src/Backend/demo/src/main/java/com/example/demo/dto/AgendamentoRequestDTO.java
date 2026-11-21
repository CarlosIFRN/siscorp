package com.example.demo.dto;

import com.example.demo.model.StatusAgendamento;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDateTime;

public record AgendamentoRequestDTO(
        @NotNull @Positive Integer idVeiculo,
        @NotNull @Positive Integer idServico,
        @NotNull LocalDateTime dataHora,
        StatusAgendamento status
) {}
