package com.example.demo.repository;

import com.example.demo.model.Sessao;
import java.util.Optional;
import java.time.Instant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

public interface SessaoRepository extends JpaRepository<Sessao, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from Sessao s join fetch s.usuario where s.tokenHash = :hash")
    Optional<Sessao> buscarPorTokenHashParaAtualizar(@Param("hash") String hash);

    @Modifying
    @Query("update Sessao s set s.revogadaEm = :agora where s.usuario.idUsuario = :id and s.revogadaEm is null")
    int revogarPorUsuario(@Param("id") Integer id, @Param("agora") Instant agora);
}
