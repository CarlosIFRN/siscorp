
package com.example.demo.service;

import com.example.demo.model.Servico;
import com.example.demo.repository.ServicoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServicoService {

    private final ServicoRepository servicoRepository;

    public ServicoService(ServicoRepository servicoRepository) {
        this.servicoRepository = servicoRepository;
    }

    public List<Servico> listarServicosAtivos() {
        return servicoRepository.findByAtivoTrue();
    }

    public List<Servico> listarServicosAtivosPorEmpresa(Integer idEmpresa) {
        return servicoRepository.findByIdEmpresaAndAtivoTrue(idEmpresa);
    }
}
