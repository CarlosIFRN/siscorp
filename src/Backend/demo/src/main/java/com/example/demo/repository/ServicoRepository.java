package com.example.demo.repository;

import com.example.demo.model.Servico;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServicoRepository
        extends JpaRepository<Servico, Integer> {

    List<Servico> findByIdEmpresaAndAtivoTrue(Integer idEmpresa);

    List<Servico> findByIdEmpresa(Integer idEmpresa);
}