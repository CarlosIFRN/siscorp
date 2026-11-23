package com.example.demo.service;

import com.example.demo.dto.UsuarioResponseDTO;
import com.example.demo.model.Sessao;
import com.example.demo.model.Usuario;
import com.example.demo.repository.SessaoRepository;
import com.example.demo.repository.UsuarioRepository;
import java.time.Instant;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarios;
    private final SessaoRepository sessoes;
    private final TokenService tokens;

    public AuthService(AuthenticationManager authenticationManager, UsuarioRepository usuarios,
            SessaoRepository sessoes, TokenService tokens) {
        this.authenticationManager = authenticationManager;
        this.usuarios = usuarios;
        this.sessoes = sessoes;
        this.tokens = tokens;
    }

    @Transactional
    public Tokens login(String email, String senha) {
        String normalizado = email.trim().toLowerCase(Locale.ROOT);
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizado, senha));
        } catch (AuthenticationException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais inválidas");
        }
        Usuario usuario = usuarios.findByEmailUsuario(normalizado)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais inválidas"));
        return emitir(usuario);
    }

    @Transactional
    public Tokens refresh(String refreshToken) {
        Sessao sessao = buscarSessao(refreshToken);
        Instant agora = Instant.now();
        if (sessao.getRevogadaEm() != null || !sessao.getExpiraEm().isAfter(agora)
                || !sessao.getUsuario().isAtivo()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sessão inválida");
        }
        sessao.setRevogadaEm(agora);
        return emitir(sessao.getUsuario());
    }

    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return;
        }
        sessoes.buscarPorTokenHashParaAtualizar(tokens.hashRefresh(refreshToken))
                .ifPresent(sessao -> {
                    if (sessao.getRevogadaEm() == null) {
                        sessao.setRevogadaEm(Instant.now());
                    }
                });
    }

    private Sessao buscarSessao(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sessão inválida");
        }
        return sessoes.buscarPorTokenHashParaAtualizar(tokens.hashRefresh(refreshToken))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sessão inválida"));
    }

    private Tokens emitir(Usuario usuario) {
        String refreshToken = tokens.novoRefresh();
        Instant agora = Instant.now();
        Sessao sessao = new Sessao();
        sessao.setUsuario(usuario);
        sessao.setTokenHash(tokens.hashRefresh(refreshToken));
        sessao.setCriadaEm(agora);
        sessao.setExpiraEm(agora.plus(tokens.duracaoRefresh()));
        sessoes.save(sessao);
        return new Tokens(tokens.emitirAcesso(usuario), refreshToken,
                tokens.segundosAcesso(), UsuarioResponseDTO.de(usuario));
    }

    public record Tokens(String accessToken, String refreshToken,
            long expiresIn, UsuarioResponseDTO usuario) {}
}
