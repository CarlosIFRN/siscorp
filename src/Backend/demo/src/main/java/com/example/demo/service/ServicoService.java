package com.example.demo.service;

import com.example.demo.model.Servico;
import com.example.demo.repository.ServicoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ServicoService {

    private final ServicoRepository repository;

    public ServicoService(ServicoRepository repository) {
        this.repository = repository;
    }

    // Lista somente os serviços ativos de uma empresa
    public List<Servico> listarAtivos(Integer idEmpresa) {
        return repository.findByIdEmpresaAndAtivoTrue(idEmpresa);
    }

    // Lista todos os serviços de uma empresa
    public List<Servico> listarTodos(Integer idEmpresa) {
        return repository.findByIdEmpresa(idEmpresa);
    }

    // Cadastra um novo serviço
    @Transactional
    public Servico cadastrar(Servico servico) {

        validar(servico);

        servico.setIdServico(null);
        servico.setAtivo(true);

        return repository.save(servico);
    }

    // Atualiza um serviço existente
    @Transactional
    public Servico atualizar(Integer id, Servico dados) {

        Servico servico = repository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Serviço não encontrado"));

        validar(dados);

        servico.setNomeServico(dados.getNomeServico().trim());
        servico.setValor(dados.getValor());
        servico.setDuracaoMinutos(dados.getDuracaoMinutos());

        return repository.save(servico);
    }

    // Desativa um serviço sem apagar do banco
    @Transactional
    public void desativar(Integer id) {

        Servico servico = repository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Serviço não encontrado"));

        servico.setAtivo(false);

        repository.save(servico);
    }

    // Valida os dados recebidos
    private void validar(Servico servico) {

        if (servico.getNomeServico() == null
                || servico.getNomeServico().isBlank()) {
            throw new IllegalArgumentException(
                    "O nome do serviço é obrigatório");
        }

        if (servico.getValor() == null
                || servico.getValor().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "O valor deve ser maior que zero");
        }

        if (servico.getDuracaoMinutos() == null
                || servico.getDuracaoMinutos() <= 0) {
            throw new IllegalArgumentException(
                    "A duração deve ser maior que zero");
        }

        if (servico.getIdEmpresa() == null) {
            throw new IllegalArgumentException(
                    "A empresa é obrigatória");
        }
    }
}