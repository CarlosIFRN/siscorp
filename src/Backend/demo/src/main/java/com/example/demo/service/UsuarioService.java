package com.example.demo.service;

import com.example.demo.dto.AtualizarUsuarioRequest;
import com.example.demo.dto.CriarUsuarioRequest;
import com.example.demo.dto.UsuarioResponse;
import com.example.demo.model.Usuario;
import com.example.demo.repository.UsuarioRepository;
import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UsuarioService {
    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listar() {
        return repository.findAll().stream().map(UsuarioResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public UsuarioResponse buscar(Integer id) {
        return UsuarioResponse.de(encontrar(id));
    }

    @Transactional
    public UsuarioResponse criar(CriarUsuarioRequest request) {
        String email = normalizarEmail(request.email());
        if (repository.existsByEmailUsuario(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado");
        }
        Usuario usuario = new Usuario();
        usuario.setNomeUsuario(request.nome().trim());
        usuario.setEmailUsuario(email);
        usuario.setSenhaHash(passwordEncoder.encode(request.senha()));
        usuario.setCargo(request.cargo());
        usuario.setTelefone(request.telefone());
        usuario.setEndereco(request.endereco());
        return UsuarioResponse.de(repository.save(usuario));
    }

    @Transactional
    public UsuarioResponse atualizar(Integer id, AtualizarUsuarioRequest request) {
        Usuario usuario = encontrar(id);
        String email = normalizarEmail(request.email());
        if (repository.existsByEmailUsuarioAndIdUsuarioNot(email, id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado");
        }
        usuario.setNomeUsuario(request.nome().trim());
        usuario.setEmailUsuario(email);
        usuario.setCargo(request.cargo());
        usuario.setTelefone(request.telefone());
        usuario.setEndereco(request.endereco());
        if (request.senha() != null && !request.senha().isBlank()) {
            usuario.setSenhaHash(passwordEncoder.encode(request.senha()));
        }
        return UsuarioResponse.de(repository.save(usuario));
    }

    @Transactional
    public void desativar(Integer id) {
        Usuario usuario = encontrar(id);
        usuario.setAtivo(false);
    }

    private Usuario encontrar(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));
    }

    private String normalizarEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
