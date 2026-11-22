# CRUD de usuários

O backend requer Java 25 LTS.

O perfil padrão `local` usa um banco H2 em arquivo (`data/cwos.mv.db`). Os usuários permanecem salvos após reiniciar o backend. O `UsuarioRepository` usa Spring Data JPA em todos os perfis.

No Windows, a partir de `src/Backend/demo`:

```cmd
mvnw.cmd spring-boot:run
```

Para usar PostgreSQL, execute os scripts em `src/BD` (inclusive `03_criar_usuarios.sql`) e defina `SPRING_PROFILES_ACTIVE=db` e `DB_PASSWORD` antes do comando. `DB_URL` e `DB_USERNAME` são opcionais; os padrões são `jdbc:postgresql://localhost:5432/cwos` e `postgres`.

O Spring Security autentica com e-mail e senha dos usuários salvos pelo Spring Data JPA. O perfil local aceita conexões apenas deste computador e, na primeira inicialização, cria `admin@cwos.local` com senha `Admin123!` se ainda não houver um administrador ativo. Altere essa senha pelo CRUD antes de usar o ambiente com outras pessoas. No perfil `db`, informe `CWOS_ADMIN_EMAIL` e `CWOS_ADMIN_PASSWORD` para criar o primeiro administrador; essas variáveis não alteram a senha de uma conta já criada.

A API usa HTTP Basic sem sessão. Envie as credenciais em cada requisição. `GET /api/auth/me` confirma a autenticação e devolve o usuário atual. Contas inativas não entram; apenas `Admin` acessa o CRUD de usuários.
O último administrador ativo não pode ser desativado nem rebaixado para outro tipo de usuário.

```cmd
curl -u admin@cwos.local:Admin123! http://127.0.0.1:8080/api/auth/me
```

## Rotas

| Método | Rota | Ação |
| --- | --- | --- |
| GET | `/api/usuarios` | Listar, incluindo desativados |
| GET | `/api/usuarios/{id}` | Buscar |
| POST | `/api/usuarios` | Criar |
| PUT | `/api/usuarios/{id}` | Atualizar |
| DELETE | `/api/usuarios/{id}` | Desativar sem apagar o registro |

Todas as rotas do CRUD exigem autenticação HTTP Basic com o papel `ADMIN`. No perfil local, use `admin@cwos.local` / `Admin123!` após a primeira inicialização.

Exemplo de cadastro:

```json
{
  "nome": "Ana Silva",
  "email": "ana@example.com",
  "senha": "senhaForte123",
  "telefone": "84999990000",
  "tipoUsuario": "Funcionario"
}
```

`tipoUsuario` pode ser `Cliente`, `Funcionario` ou `Admin`; se omitido na criação, assume `Funcionario`. Na atualização, omitir `senha` e `tipoUsuario` mantém os valores atuais. A API devolve `id`, `nome`, `email`, `telefone`, `ativo` e `tipoUsuario`, sem devolver a senha. O e-mail é normalizado para minúsculas e deve ser único. Um e-mail duplicado retorna HTTP 409; um ID inexistente retorna HTTP 404.

O frontend ainda não envia credenciais para a API. O botão “Sair” permanece desativado até a integração do login na interface; com HTTP Basic, sair significa descartar as credenciais no cliente.
