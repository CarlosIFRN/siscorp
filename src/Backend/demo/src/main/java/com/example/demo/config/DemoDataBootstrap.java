package com.example.demo.config;

import com.example.demo.model.Empresa;
import com.example.demo.model.TipoUsuario;
import com.example.demo.model.Usuario;
import com.example.demo.repository.EmpresaRepository;
import com.example.demo.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Profile({"local", "demo"})
@Order(1)
public class DemoDataBootstrap implements ApplicationRunner {
    private static final String CNPJ = "99.999.999/0001-99";
    private final EmpresaRepository empresas;
    private final UsuarioRepository usuarios;
    private final PasswordEncoder encoder;
    private final String senhaMateus;
    private final String senhaDiogo;
    private final String senhaJoao;
    private final String senhaLaercio;

    public DemoDataBootstrap(EmpresaRepository empresas, UsuarioRepository usuarios, PasswordEncoder encoder,
            @Value("${cwos.demo.mateus-password:}") String senhaMateus,
            @Value("${cwos.demo.diogo-password:}") String senhaDiogo,
            @Value("${cwos.demo.joao-password:}") String senhaJoao,
            @Value("${cwos.demo.laercio-password:}") String senhaLaercio) {
        this.empresas = empresas;
        this.usuarios = usuarios;
        this.encoder = encoder;
        this.senhaMateus = senhaMateus;
        this.senhaDiogo = senhaDiogo;
        this.senhaJoao = senhaJoao;
        this.senhaLaercio = senhaLaercio;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        Empresa empresa = empresas.findByCnpj(CNPJ).orElseGet(() -> {
            Empresa nova = new Empresa();
            nova.setNomeEmpresa("Lava Jato CWOS Demo");
            nova.setCnpj(CNPJ);
            return empresas.save(nova);
        });
        criarSeAusente(empresa, "Mateus Gonçalves", "goncalves.mateus@escolar.ifrn.edu.br",
                senhaMateus, "84999990001", TipoUsuario.Admin);
        criarSeAusente(empresa, "Diogo Ribeiro", "diogo.ribeiro@escolar.ifrn.edu.br",
                senhaDiogo, "84999990002", TipoUsuario.Admin);
        criarSeAusente(empresa, "João Vitor", "joao.vitor3@escolar.ifrn.edu.br",
                senhaJoao, "84999990003", TipoUsuario.Funcionario);
        criarSeAusente(empresa, "Laércio", "laercio.f@escolar.ifrn.edu.br",
                senhaLaercio, "84999990004", TipoUsuario.Funcionario);
    }

    private void criarSeAusente(Empresa empresa, String nome, String email, String senha,
            String telefone, TipoUsuario tipoUsuario) {
        if (usuarios.existsByEmailUsuario(email) || senha.isBlank()) {
            return;
        }
        Usuario usuario = new Usuario();
        usuario.setNomeUsuario(nome);
        usuario.setEmailUsuario(email);
        usuario.setSenhaHash(encoder.encode(senha));
        usuario.setTelefone(telefone);
        usuario.setTipoUsuario(tipoUsuario);
        usuario.setEmpresa(empresa);
        usuarios.save(usuario);
    }
}
