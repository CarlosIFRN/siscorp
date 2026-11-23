
package com.example.demo.repository;

import com.example.demo.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    Optional<Usuario> findByEmailUsuarioIgnoreCase(String email);

    boolean existsByEmailUsuarioIgnoreCase(String email);

    boolean existsByEmailUsuarioIgnoreCaseAndIdUsuarioNot(
            String email,
            Integer ignorarId
    );

    List<Usuario> findByAtivo(boolean ativo);

    default boolean existsByEmail(String email, Integer ignorarId) {
        if (ignorarId == null) {
            return existsByEmailUsuarioIgnoreCase(email);
        }

        return existsByEmailUsuarioIgnoreCaseAndIdUsuarioNot(
                email,
                ignorarId
        );
    }
}
