package com.example.demo;

import com.example.demo.dto.AtualizarUsuarioRequest;
import com.example.demo.dto.CriarUsuarioRequest;
import com.example.demo.dto.UsuarioResponse;
import com.example.demo.model.Cargo;
import com.example.demo.model.Usuario;
import com.example.demo.repository.UsuarioRepository;
import com.example.demo.service.UsuarioService;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;

class UsuarioServiceTests {
    private final UsuarioRepository repository = new UsuarioRepository();
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    private final UsuarioService service = new UsuarioService(repository, encoder);

    @Test
    void criaConsultaAtualizaEDesativaUsuario() {
        UsuarioResponse criado = service.criar(new CriarUsuarioRequest(
                " Ana ", "ANA@EXEMPLO.COM", "senhaForte123",
                Cargo.CLIENTE, "84999990000", "Rua A"
        ));
        assertEquals(1, criado.id());
        assertEquals("Ana", criado.nome());
        assertEquals("ana@exemplo.com", criado.email());
        assertEquals(1, service.listar().size());

        Usuario salvo = repository.findById(criado.id()).orElseThrow();
        assertNotEquals("senhaForte123", salvo.getSenhaHash());
        assertTrue(encoder.matches("senhaForte123", salvo.getSenhaHash()));

        UsuarioResponse atualizado = service.atualizar(criado.id(), new AtualizarUsuarioRequest(
                "Ana Silva", "ana@exemplo.com", null,
                Cargo.CLIENTE, "84999990000", "Rua B"
        ));
        assertEquals("Ana Silva", atualizado.nome());
        assertTrue(encoder.matches("senhaForte123", salvo.getSenhaHash()));

        service.desativar(criado.id());
        assertFalse(service.buscar(criado.id()).ativo());
    }

    @Test
    void rejeitaEmailDuplicadoMesmoComMaiusculas() {
        service.criar(new CriarUsuarioRequest(
                "Ana", "ana@exemplo.com", "senhaForte123",
                Cargo.CLIENTE, null, null
        ));
        assertThrows(ResponseStatusException.class, () -> service.criar(
                new CriarUsuarioRequest("Outra", "ANA@EXEMPLO.COM", "outraSenha123",
                        Cargo.CLIENTE, null, null)));
    }
}
