package com.example.demo.repository;

import com.example.demo.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    boolean existsByEmailUsuario(String emailUsuario);
    boolean existsByEmailUsuarioAndIdUsuarioNot(String emailUsuario, Integer idUsuario);
}
