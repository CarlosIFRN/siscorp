package com.example.demo.service;

import com.example.demo.model.Usuario;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

@Service
public class TokenService {
    private final JwtEncoder jwtEncoder;
    private final SecureRandom random = new SecureRandom();
    private final Duration duracaoAcesso;
    private final Duration duracaoRefresh;

    public TokenService(JwtEncoder jwtEncoder,
            @Value("${cwos.auth.access-minutes:15}") long minutosAcesso,
            @Value("${cwos.auth.refresh-days:7}") long diasRefresh) {
        if (minutosAcesso <= 0 || diasRefresh <= 0) {
            throw new IllegalArgumentException("A duração dos tokens deve ser positiva");
        }
        this.jwtEncoder = jwtEncoder;
        this.duracaoAcesso = Duration.ofMinutes(minutosAcesso);
        this.duracaoRefresh = Duration.ofDays(diasRefresh);
    }

    public String emitirAcesso(Usuario usuario) {
        Instant agora = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("cwos")
                .subject(usuario.getEmailUsuario())
                .issuedAt(agora)
                .expiresAt(agora.plus(duracaoAcesso))
                .claim("token_type", "access")
                .claim("roles", List.of("ROLE_" + usuario.getTipoUsuario().name().toUpperCase(Locale.ROOT)))
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }

    public String novoRefresh() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public String hashRefresh(String token) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 indisponível", ex);
        }
    }

    public Duration duracaoRefresh() { return duracaoRefresh; }
    public long segundosAcesso() { return duracaoAcesso.toSeconds(); }
}
