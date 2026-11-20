package com.example.demo.repository;

import com.example.demo.model.Agendamento;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AgendamentoRepository extends JpaRepository<Agendamento, Integer> {
    List<Agendamento> findAllByOrderByDataHoraAsc();

    List<Agendamento> findByDataHoraGreaterThanEqualAndDataHoraLessThanOrderByDataHoraAsc(
            LocalDateTime inicio, LocalDateTime fim);

    @Query(value = "SELECT COUNT(*) FROM veiculos WHERE id_veiculo = :id", nativeQuery = true)
    long contarVeiculo(@Param("id") Integer id);

    @Query(value = "SELECT COUNT(*) FROM servicos WHERE id_servico = :id AND ativo = true", nativeQuery = true)
    long contarServicoAtivo(@Param("id") Integer id);
}
