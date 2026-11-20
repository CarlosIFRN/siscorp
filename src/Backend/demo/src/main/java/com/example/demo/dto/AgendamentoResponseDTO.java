package com.example.demo.dto;

import com.example.demo.model.Agendamento;
import com.example.demo.model.StatusAgendamento;
import java.time.LocalDateTime;

public record AgendamentoResponseDTO(
        Integer idAgendamento,
        Integer idVeiculo,
        Integer idServico,
        LocalDateTime dataHora,
        StatusAgendamento status
) {
    public static AgendamentoResponseDTO de(Agendamento agendamento) {
        return new AgendamentoResponseDTO(
                agendamento.getIdAgendamento(), agendamento.getIdVeiculo(),
                agendamento.getIdServico(), agendamento.getDataHora(), agendamento.getStatus());
    }
}
