package com.example.demo.repository;

import org.springframework.context.annotation.Profile;

import com.example.demo.model.Usuario;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.stereotype.Repository;

@Profile("memory")
@Repository
public class UsuarioRepository {
    private final Map<Integer, Usuario> usuarios = new ConcurrentHashMap<>();
    private final AtomicInteger sequencia = new AtomicInteger();

    public List<Usuario> findAll() {
        return usuarios.values().stream()
                .sorted(Comparator.comparing(Usuario::getIdUsuario))
                .toList();
    }

    public Optional<Usuario> findById(Integer id) {
        return Optional.ofNullable(usuarios.get(id));
    }

    public boolean existsByEmail(String email, Integer ignorarId) {
        return usuarios.values().stream().anyMatch(usuario ->
                usuario.getEmailUsuario().equals(email)
                        && !usuario.getIdUsuario().equals(ignorarId));
    }

    public Usuario save(Usuario usuario) {
        if (usuario.getIdUsuario() == null) {
            usuario.setIdUsuario(sequencia.incrementAndGet());
        }
        usuarios.put(usuario.getIdUsuario(), usuario);
        return usuario;
    }
}
