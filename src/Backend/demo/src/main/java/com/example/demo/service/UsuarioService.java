package com.example.demo.service;

import org.springframework.context.annotation.Profile;

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

    public List<UsuarioResponse> listar() {
        return repository.findAll().stream().map(UsuarioResponse::de).toList();
    }

    public UsuarioResponse buscar(Integer id) {
        return UsuarioResponse.de(encontrar(id));
    }

    public synchronized UsuarioResponse criar(CriarUsuarioRequest request) {
        String email = normalizarEmail(request.email());
        validarEmailUnico(email, null);
        Usuario usuario = new Usuario();
        usuario.setNomeUsuario(request.nome().trim());
        usuario.setEmailUsuario(email);
        usuario.setSenhaHash(passwordEncoder.encode(request.senha()));
        usuario.setCargo(request.cargo());
        usuario.setTelefone(request.telefone());
        usuario.setEndereco(request.endereco());
        return UsuarioResponse.de(repository.save(usuario));
    }

    public synchronized UsuarioResponse atualizar(Integer id, AtualizarUsuarioRequest request) {
        Usuario usuario = encontrar(id);
        String email = normalizarEmail(request.email());
        validarEmailUnico(email, id);
        usuario.setNomeUsuario(request.nome().trim());
        usuario.setEmailUsuario(email);
        usuario.setCargo(request.cargo());
        usuario.setTelefone(request.telefone());
        usuario.setEndereco(request.endereco());
        if (request.senha() != null) {
            usuario.setSenhaHash(passwordEncoder.encode(request.senha()));
        }
        return UsuarioResponse.de(repository.save(usuario));
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
