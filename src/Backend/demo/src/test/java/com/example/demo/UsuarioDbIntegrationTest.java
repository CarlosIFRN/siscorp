package com.example.demo;

import com.example.demo.dto.UsuarioRequestDTO;
import com.example.demo.model.TipoUsuario;
import com.example.demo.repository.UsuarioRepository;
import com.example.demo.service.UsuarioService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:usuarios;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@ActiveProfiles("db")
class UsuarioDbIntegrationTest {
    @Autowired private UsuarioService service;
    @Autowired private UsuarioRepository repository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Test
    void criaAtualizaEDesativaUsuarioPersistido() {
        var criado = service.criar(new UsuarioRequestDTO(
                " Ana Silva ", " ANA@EXAMPLE.COM ", "SenhaForte123", " 84999990000 ", null));

        assertEquals("Ana Silva", criado.nome());
        assertEquals("ana@example.com", criado.email());
        assertEquals(TipoUsuario.Funcionario, criado.tipoUsuario());
        assertTrue(passwordEncoder.matches("SenhaForte123",
                repository.findById(criado.id()).orElseThrow().getSenhaHash()));

        var atualizado = service.atualizar(criado.id(), new UsuarioRequestDTO(
                "Ana Atualizada", "ana@example.com", null, "84988880000", TipoUsuario.Admin));
        assertEquals("Ana Atualizada", service.buscar(criado.id()).nome());
        assertEquals(TipoUsuario.Admin, atualizado.tipoUsuario());
        assertTrue(passwordEncoder.matches("SenhaForte123",
                repository.findById(criado.id()).orElseThrow().getSenhaHash()));

        var conflito = assertThrows(ResponseStatusException.class, () -> service.criar(
                new UsuarioRequestDTO("Outra Ana", "ana@example.com", "SenhaForte456", "84999990000", null)));
        assertEquals(HttpStatus.CONFLICT, conflito.getStatusCode());

        service.criar(new UsuarioRequestDTO(
                "Administrador reserva", "reserva@example.com", "SenhaForte789", "84977770000", TipoUsuario.Admin));
        service.desativar(criado.id());
        assertFalse(service.buscar(criado.id()).ativo());
    }
}
