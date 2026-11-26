# CRUD de usuários

O backend usa Spring Data JPA e Spring Security. O perfil padrão `local` usa H2 em arquivo (`data/cwos.mv.db`). Para PostgreSQL, configure `DB_PASSWORD`, `CWOS_JWT_SECRET` e inicie com `--spring.profiles.active=db,demo`. `DB_URL` e `DB_USERNAME` são opcionais; os padrões são `jdbc:postgresql://localhost:5432/cwos` e `postgres`. O servidor PostgreSQL precisa estar em execução.

O perfil `demo` cria pelo JPA a empresa fictícia Lava Jato CWOS Demo. Para criar as quatro contas em um banco novo, configure as variáveis de senha indicadas em `README.auth.md`; nenhuma senha fica no repositório. Mateus e Diogo são administradores; João e Laércio são funcionários. Telefones são dados fictícios. O perfil `local` também cria a empresa e o administrador inicial `admin@cwos.local`.

Faça login em `POST /api/auth/login` e use o JWT no cabeçalho `Authorization: Bearer <token>`. Consulte `README.auth.md` para o fluxo de CSRF, renovação e logout. O último administrador ativo não pode ser desativado nem rebaixado.

| Método | Rota | Ação |
| --- | --- | --- |
| GET | `/api/empresas` | Listar empresas para o cadastro |
| GET | `/api/usuarios` | Listar usuários, incluindo desativados |
| GET | `/api/usuarios/{id}` | Buscar usuário |
| POST | `/api/usuarios` | Criar usuário |
| PUT | `/api/usuarios/{id}` | Atualizar usuário |
| DELETE | `/api/usuarios/{id}` | Desativar usuário |

Essas rotas exigem o papel `Admin`. Para criar uma conta, selecione uma empresa existente:

```json
{
  "nome": "Ana Silva",
  "email": "ana@example.com",
  "senha": "senhaForte123",
  "telefone": "84999990000",
  "tipoUsuario": "Funcionario",
  "idEmpresa": 1
}
```

`tipoUsuario` pode ser `Cliente`, `Funcionario` ou `Admin`; se omitido na criação, assume `Funcionario`. Na atualização, omitir `senha`, `tipoUsuario` ou `idEmpresa` mantém o valor anterior. A resposta não inclui a senha. E-mail duplicado retorna 409; usuário ou empresa inexistente retorna 404.
