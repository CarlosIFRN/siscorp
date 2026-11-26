package com.example.demo.config;

import com.example.demo.model.TipoUsuario;
import com.example.demo.model.Usuario;
import com.example.demo.repository.UsuarioRepository;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Order(0)
public class AdminBootstrap implements ApplicationRunner {
    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final String email;
    private final String senha;

    public AdminBootstrap(UsuarioRepository repository, PasswordEncoder passwordEncoder,
            @Value("${cwos.bootstrap-admin.email:}") String email,
            @Value("${cwos.bootstrap-admin.password:}") String senha) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.email = email;
        this.senha = senha;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (email.isBlank() || senha.isBlank() || repository.existsByTipoUsuarioAndAtivoTrue(TipoUsuario.Admin)) {
            return;
        }
        if (senha.length() < 8) {
            throw new IllegalStateException("A senha do administrador inicial deve ter ao menos 8 caracteres");
        }
        String normalizado = email.trim().toLowerCase(Locale.ROOT);
        if (repository.existsByEmailUsuario(normalizado)) {
            throw new IllegalStateException("O e-mail do administrador inicial já pertence a outro usuário");
        }
        Usuario admin = new Usuario();
        admin.setNomeUsuario("Administrador");
        admin.setEmailUsuario(normalizado);
        admin.setSenhaHash(passwordEncoder.encode(senha));
        admin.setTelefone("00000000000");
        admin.setTipoUsuario(TipoUsuario.Admin);
        repository.saveAndFlush(admin);
    }
}
