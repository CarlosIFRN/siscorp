package com.example.demo.repository;

import com.example.demo.model.Usuario;
import com.example.demo.model.TipoUsuario;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    List<Usuario> findAllByOrderByIdUsuarioAsc();
    boolean existsByEmailUsuario(String email);
    boolean existsByEmailUsuarioAndIdUsuarioNot(String email, Integer id);
    boolean existsByTipoUsuarioAndAtivoTrue(TipoUsuario tipoUsuario);
    long countByTipoUsuarioAndAtivoTrue(TipoUsuario tipoUsuario);
    Optional<Usuario> findByEmailUsuario(String email);
}
