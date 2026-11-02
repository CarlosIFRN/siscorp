# CRUD de Usuario em memoria

O perfil padrão do backend é `memory`. Nele, `UsuarioRepository` guarda usuários em memória; os registros desaparecem ao reiniciar a aplicação. Não é necessário configurar PostgreSQL para testar esse CRUD.

## Endpoints

Todas as rotas abaixo exigem `ADMIN` pela configuração de segurança atual:

| Método | Rota | Efeito |
| --- | --- | --- |
| GET | `/api/usuarios` | Lista usuários |
| GET | `/api/usuarios/{id}` | Busca um usuário |
| POST | `/api/usuarios` | Cria um usuário |
| PUT | `/api/usuarios/{id}` | Atualiza dados e, se enviada, a senha |
| DELETE | `/api/usuarios/{id}` | Desativa sem apagar |

Exemplo de POST:

```json
{
  "nome": "Ana Silva",
  "email": "ana@example.com",
  "senha": "senhaForte123",
  "cargo": "CLIENTE",
  "telefone": "84999990000",
  "endereco": "Rua A"
}
```

As respostas usam `UsuarioResponse` e nunca contêm a senha. O e-mail é normalizado para minúsculas e não pode ser duplicado. As senhas são armazenadas com o `PasswordEncoder` já configurado no projeto (bcrypt).

O perfil `db` preserva a configuração PostgreSQL anterior para o módulo de serviços. Este CRUD em memória é ativado apenas no perfil `memory`. O login ainda utiliza os usuários de demonstração configurados em `SecurityConfig`; integrar o login com os `Usuario` cadastrados é uma etapa separada.
