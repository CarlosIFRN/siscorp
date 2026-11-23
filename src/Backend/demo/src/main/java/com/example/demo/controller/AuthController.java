package com.example.demo.controller;

import com.example.demo.dto.AuthResponseDTO;
import com.example.demo.dto.LoginRequestDTO;
import com.example.demo.dto.UsuarioResponseDTO;
import com.example.demo.repository.UsuarioRepository;
import com.example.demo.service.AuthService;
import com.example.demo.service.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.security.Principal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final String REFRESH_COOKIE = "CWOS_REFRESH";
    private final AuthService authService;
    private final TokenService tokens;
    private final UsuarioRepository usuarios;
    private final boolean cookieSeguro;

    public AuthController(AuthService authService, TokenService tokens, UsuarioRepository usuarios,
            @Value("${cwos.auth.secure-cookie:true}") boolean cookieSeguro) {
        this.authService = authService;
        this.tokens = tokens;
        this.usuarios = usuarios;
        this.cookieSeguro = cookieSeguro;
    }

    @GetMapping("/csrf")
    public ResponseEntity<Void> csrf(HttpServletRequest request) {
        CsrfToken token = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        token.getToken();
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        return responder(authService.login(request.email(), request.senha()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponseDTO> refresh(
            @CookieValue(value = REFRESH_COOKIE, required = false) String refreshToken) {
        return responder(authService.refresh(refreshToken));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(value = REFRESH_COOKIE, required = false) String refreshToken) {
        authService.logout(refreshToken);
        ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE, "")
                .httpOnly(true).secure(cookieSeguro).sameSite("Strict")
                .path("/api/auth").maxAge(0).build();
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .cacheControl(CacheControl.noStore()).build();
    }

    @GetMapping("/me")
    public UsuarioResponseDTO me(Principal principal) {
        return usuarios.findByEmailUsuario(principal.getName())
                .map(UsuarioResponseDTO::de)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    private ResponseEntity<AuthResponseDTO> responder(AuthService.Tokens emitidos) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE, emitidos.refreshToken())
                .httpOnly(true).secure(cookieSeguro).sameSite("Strict")
                .path("/api/auth").maxAge(tokens.duracaoRefresh()).build();
        AuthResponseDTO corpo = new AuthResponseDTO(emitidos.accessToken(), "Bearer",
                emitidos.expiresIn(), emitidos.usuario());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .cacheControl(CacheControl.noStore()).body(corpo);
    }
}
