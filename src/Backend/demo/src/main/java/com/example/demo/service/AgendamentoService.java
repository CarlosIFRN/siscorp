package com.example.demo.service;

import com.example.demo.dto.AgendamentoRequestDTO;
import com.example.demo.model.Agendamento;
import com.example.demo.model.StatusAgendamento;
import com.example.demo.repository.AgendamentoRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AgendamentoService {
    private final AgendamentoRepository repository;

    public AgendamentoService(AgendamentoRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<Agendamento> listar(LocalDate data) {
        if (data == null) return repository.findAllByOrderByDataHoraAsc();
        return repository.findByDataHoraGreaterThanEqualAndDataHoraLessThanOrderByDataHoraAsc(
                data.atStartOfDay(), data.plusDays(1).atStartOfDay());
    }

    @Transactional(readOnly = true)
    public Agendamento buscar(Integer id) {
        return repository.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Agendamento não encontrado"));
    }

    @Transactional
    public Agendamento criar(AgendamentoRequestDTO request) {
        validarReferencias(request);
        Agendamento agendamento = new Agendamento();
        aplicarDados(agendamento, request);
        agendamento.setStatus(StatusAgendamento.AGENDADO);
        return repository.save(agendamento);
    }

    @Transactional
    public Agendamento atualizar(Integer id, AgendamentoRequestDTO request) {
        Agendamento agendamento = buscar(id);
        validarReferencias(request);
        aplicarDados(agendamento, request);
        if (request.status() != null) agendamento.setStatus(request.status());
        return repository.save(agendamento);
    }

    @Transactional
    public void excluir(Integer id) {
        Agendamento agendamento = buscar(id);
        repository.delete(agendamento);
    }

    private void validarReferencias(AgendamentoRequestDTO request) {
        if (repository.contarVeiculo(request.idVeiculo()) == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Veículo não encontrado");
        }
        if (repository.contarServicoAtivo(request.idServico()) == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Serviço não encontrado ou inativo");
        }
    }

    private void aplicarDados(Agendamento agendamento, AgendamentoRequestDTO request) {
        agendamento.setIdVeiculo(request.idVeiculo());
        agendamento.setIdServico(request.idServico());
        agendamento.setDataHora(request.dataHora());
    }
}
