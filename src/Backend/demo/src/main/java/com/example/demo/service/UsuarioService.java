package com.example.demo.service;

import com.example.demo.dto.UsuarioRequestDTO;
import com.example.demo.dto.UsuarioResponseDTO;
import com.example.demo.model.Usuario;
import com.example.demo.repository.UsuarioRepository;
import java.util.List;
import java.util.Locale;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Profile("memory")
@Service
public class UsuarioService {
    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UsuarioResponseDTO> listar() {
        return repository.findAll().stream().map(UsuarioResponseDTO::de).toList();
    }

    public UsuarioResponseDTO buscar(Integer id) {
        return UsuarioResponseDTO.de(encontrar(id));
    }

    public synchronized UsuarioResponseDTO criar(UsuarioRequestDTO request) {
        String email = normalizarEmail(request.email());
        validarEmailUnico(email, null);
        Usuario usuario = new Usuario();
        usuario.setNomeUsuario(request.nome().trim());
        usuario.setEmailUsuario(email);
        usuario.setSenhaHash(passwordEncoder.encode(request.senha()));
        usuario.setTelefone(request.telefone());
        return UsuarioResponseDTO.de(repository.save(usuario));
    }

    public synchronized UsuarioResponseDTO atualizar(Integer id, UsuarioRequestDTO request) {
        Usuario usuario = encontrar(id);
        String email = normalizarEmail(request.email());
        validarEmailUnico(email, id);
        usuario.setNomeUsuario(request.nome().trim());
        usuario.setEmailUsuario(email);
        usuario.setTelefone(request.telefone());
        if (request.senha() != null) {
            usuario.setSenhaHash(passwordEncoder.encode(request.senha()));
        }
        return UsuarioResponseDTO.de(repository.save(usuario));
    }

    public synchronized void desativar(Integer id) {
        Usuario usuario = encontrar(id);
        usuario.setAtivo(false);
        repository.save(usuario);
    }

    private Usuario encontrar(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));
    }

    private void validarEmailUnico(String email, Integer ignorarId) {
        if (repository.existsByEmail(email, ignorarId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado");
        }
    }

    private String normalizarEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
