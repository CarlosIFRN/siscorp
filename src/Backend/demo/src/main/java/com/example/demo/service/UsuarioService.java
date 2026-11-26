package com.example.demo.service;

import com.example.demo.dto.UsuarioRequestDTO;
import com.example.demo.dto.UsuarioResponseDTO;
import com.example.demo.model.Usuario;
import com.example.demo.model.TipoUsuario;
import com.example.demo.repository.UsuarioRepository;
import com.example.demo.repository.SessaoRepository;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@PreAuthorize("hasRole('ADMIN')")
public class UsuarioService {
    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final SessaoRepository sessoes;

    public UsuarioService(UsuarioRepository repository, PasswordEncoder passwordEncoder,
            SessaoRepository sessoes) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.sessoes = sessoes;
    }

    public List<UsuarioResponseDTO> listar() {
        return repository.findAllByOrderByIdUsuarioAsc().stream().map(UsuarioResponseDTO::de).toList();
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
        usuario.setTelefone(request.telefone().trim());
        usuario.setTipoUsuario(request.tipoUsuario() == null ? TipoUsuario.Funcionario : request.tipoUsuario());
        return UsuarioResponseDTO.de(salvar(usuario));
    }

    @Transactional
    public synchronized UsuarioResponseDTO atualizar(Integer id, UsuarioRequestDTO request) {
        Usuario usuario = encontrar(id);
        if (request.tipoUsuario() != null && request.tipoUsuario() != TipoUsuario.Admin) {
            protegerUltimoAdmin(usuario);
        }
        String email = normalizarEmail(request.email());
        validarEmailUnico(email, id);
        usuario.setNomeUsuario(request.nome().trim());
        usuario.setEmailUsuario(email);
        usuario.setTelefone(request.telefone().trim());
        if (request.tipoUsuario() != null) {
            usuario.setTipoUsuario(request.tipoUsuario());
        }
        if (request.senha() != null) {
            usuario.setSenhaHash(passwordEncoder.encode(request.senha()));
            sessoes.revogarPorUsuario(id, Instant.now());
        }
        return UsuarioResponseDTO.de(salvar(usuario));
    }

    @Transactional
    public synchronized void desativar(Integer id) {
        Usuario usuario = encontrar(id);
        protegerUltimoAdmin(usuario);
        usuario.setAtivo(false);
        sessoes.revogarPorUsuario(id, Instant.now());
        salvar(usuario);
    }

    private void protegerUltimoAdmin(Usuario usuario) {
        if (usuario.isAtivo() && usuario.getTipoUsuario() == TipoUsuario.Admin
                && repository.countByTipoUsuarioAndAtivoTrue(TipoUsuario.Admin) <= 1) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Não é possível remover o último administrador ativo");
        }
    }

    private Usuario encontrar(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));
    }

    private void validarEmailUnico(String email, Integer ignorarId) {
        boolean existente = ignorarId == null
                ? repository.existsByEmailUsuario(email)
                : repository.existsByEmailUsuarioAndIdUsuarioNot(email, ignorarId);
        if (existente) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado");
        }
    }

    private Usuario salvar(Usuario usuario) {
        try {
            return repository.saveAndFlush(usuario);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado", ex);
        }
    }

    private String normalizarEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
