package com.example.demo;

import com.example.demo.dto.UsuarioRequestDTO;
import com.example.demo.model.TipoUsuario;
import com.example.demo.service.UsuarioService;
import com.example.demo.repository.UsuarioRepository;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "spring.datasource.url=jdbc:h2:mem:auth;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "cwos.bootstrap-admin.email=admin@test.local",
        "cwos.bootstrap-admin.password=SenhaAdmin123"
})
@ActiveProfiles("local")
class UsuarioSecurityIntegrationTest {
    @Value("${local.server.port}") private int port;
    @Autowired private UsuarioService service;
    @Autowired private UsuarioRepository repository;

    @Test
    void autenticaUsuariosDoBancoERespeitaPapelEEstado() throws Exception {
        var funcionario = service.criar(new UsuarioRequestDTO(
                "Funcionario", "funcionario@test.local", "SenhaFunc123", "84999990000", null));

        assertEquals(401, get("/api/auth/me", null).statusCode());
        assertEquals(401, get("/api/auth/me", "admin:SenhaErrada").statusCode());
        assertEquals(401, get("/api/auth/me", "admin:Admin123!").statusCode());

        var admin = get("/api/auth/me", "admin@test.local:SenhaAdmin123");
        assertEquals(200, admin.statusCode());
        assertTrue(admin.body().contains("admin@test.local"));
        assertEquals(200, get("/api/usuarios", "admin@test.local:SenhaAdmin123").statusCode());

        assertEquals(200, get("/api/auth/me", "funcionario@test.local:SenhaFunc123").statusCode());
        assertEquals(403, get("/api/usuarios", "funcionario@test.local:SenhaFunc123").statusCode());

        service.desativar(funcionario.id());
        assertEquals(401, get("/api/auth/me", "funcionario@test.local:SenhaFunc123").statusCode());

        var adminPersistido = repository.findByEmailUsuario("admin@test.local").orElseThrow();
        assertThrows(ResponseStatusException.class, () -> service.desativar(adminPersistido.getIdUsuario()));
        assertThrows(ResponseStatusException.class, () -> service.atualizar(adminPersistido.getIdUsuario(),
                new UsuarioRequestDTO("Administrador", "admin@test.local", null, "00000000000",
                        TipoUsuario.Funcionario)));
    }

    private HttpResponse<String> get(String path, String credentials) throws Exception {
        var request = HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + path));
        if (credentials != null) {
            String encoded = Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
            request.header("Authorization", "Basic " + encoded);
        }
        try (HttpClient client = HttpClient.newHttpClient()) {
            return client.send(request.GET().build(), HttpResponse.BodyHandlers.ofString());
        }
    }
}
