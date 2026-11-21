package com.example.demo;

import com.example.demo.dto.UsuarioRequestDTO;
import com.example.demo.model.TipoUsuario;
import com.example.demo.service.UsuarioService;
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
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "spring.datasource.url=jdbc:h2:mem:agenda;DB_CLOSE_DELAY=-1",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "cwos.bootstrap-admin.email=admin@agenda.local",
        "cwos.bootstrap-admin.password=SenhaAdmin123"
})
@ActiveProfiles("local")
class AgendamentoIntegrationTest {
    @Value("${local.server.port}") private int port;
    @Autowired private JdbcTemplate jdbc;
    @Autowired private UsuarioService usuarios;

    @Test
    void crudValidaReferenciasEPermissoes() throws Exception {
        jdbc.update("INSERT INTO veiculos (placa, marca, modelo, tipo_veiculo, ativo) "
                + "VALUES ('ABC1234', 'Marca', 'Modelo', 'CARRO', true)");
        jdbc.update("INSERT INTO servicos (id_empresa, nome_servico, valor, duracao_minutos, ativo) "
                + "VALUES (1, 'Lavagem', 50.00, 60, true)");
        Integer veiculo = jdbc.queryForObject("SELECT id_veiculo FROM veiculos WHERE placa = 'ABC1234'", Integer.class);
        Integer servico = jdbc.queryForObject("SELECT id_servico FROM servicos WHERE nome_servico = 'Lavagem'", Integer.class);
        usuarios.criar(new UsuarioRequestDTO("Funcionario", "funcionario@agenda.local", "SenhaFunc123", "84999990000", null));
        usuarios.criar(new UsuarioRequestDTO("Cliente", "cliente@agenda.local", "SenhaCliente123", "84999990001", TipoUsuario.Cliente));

        String corpo = "{\"idVeiculo\":" + veiculo + ",\"idServico\":" + servico
                + ",\"dataHora\":\"2030-02-10T13:00:00\"}";
        assertEquals(401, enviar("GET", "/api/agendamentos", null, null).statusCode());
        assertEquals(403, enviar("GET", "/api/agendamentos", null,
                "cliente@agenda.local:SenhaCliente123").statusCode());
        assertEquals(400, enviar("POST", "/api/agendamentos", corpo.replace("\"idVeiculo\":" + veiculo,
                "\"idVeiculo\":999999"), "admin@agenda.local:SenhaAdmin123").statusCode());

        var criado = enviar("POST", "/api/agendamentos", corpo, "funcionario@agenda.local:SenhaFunc123");
        assertEquals(201, criado.statusCode());
        assertTrue(criado.body().contains("\"status\":\"AGENDADO\""));
        String localizacao = criado.headers().firstValue("Location").orElseThrow();
        assertEquals(200, enviar("GET", localizacao, null, "funcionario@agenda.local:SenhaFunc123").statusCode());
        assertEquals(1, contar(enviar("GET", "/api/agendamentos?data=2030-02-10", null,
                "admin@agenda.local:SenhaAdmin123").body()));
        assertEquals(0, contar(enviar("GET", "/api/agendamentos?data=2030-02-11", null,
                "admin@agenda.local:SenhaAdmin123").body()));

        String atualizado = corpo.replace("13:00:00", "14:00:00").replace("}", ",\"status\":\"EM_LAVAGEM\"}");
        var edicao = enviar("PUT", localizacao, atualizado, "admin@agenda.local:SenhaAdmin123");
        assertEquals(200, edicao.statusCode());
        assertTrue(edicao.body().contains("\"status\":\"EM_LAVAGEM\""));
        assertTrue(edicao.body().contains("14:00:00"));

        assertEquals(204, enviar("DELETE", localizacao, null, "admin@agenda.local:SenhaAdmin123").statusCode());
        assertEquals(404, enviar("GET", localizacao, null, "admin@agenda.local:SenhaAdmin123").statusCode());

        jdbc.update("UPDATE servicos SET ativo = false WHERE id_servico = ?", servico);
        assertEquals(400, enviar("POST", "/api/agendamentos", corpo,
                "admin@agenda.local:SenhaAdmin123").statusCode());
    }

    private int contar(String json) {
        return json.equals("[]") ? 0 : json.split("idAgendamento").length - 1;
    }

    private HttpResponse<String> enviar(String metodo, String caminho, String json, String credenciais) throws Exception {
        var builder = HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + caminho));
        if (credenciais != null) {
            String token = Base64.getEncoder().encodeToString(credenciais.getBytes(StandardCharsets.UTF_8));
            builder.header("Authorization", "Basic " + token);
        }
        if (json != null) builder.header("Content-Type", "application/json");
        builder.method(metodo, json == null ? HttpRequest.BodyPublishers.noBody()
                : HttpRequest.BodyPublishers.ofString(json));
        try (HttpClient client = HttpClient.newHttpClient()) {
            return client.send(builder.build(), HttpResponse.BodyHandlers.ofString());
        }
    }
}
