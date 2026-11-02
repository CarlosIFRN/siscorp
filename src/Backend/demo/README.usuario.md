# CRUD de Usuario em memória

O perfil padrão do backend é `memory`. O `UsuarioRepository` guarda os usuários em memória, portanto os dados desaparecem quando a aplicação é reiniciada.

## Rotas

| Método | Rota | Ação |
| --- | --- | --- |
| GET | `/api/usuarios` | Listar |
| GET | `/api/usuarios/{id}` | Buscar |
| POST | `/api/usuarios` | Criar |
| PUT | `/api/usuarios/{id}` | Atualizar |
| DELETE | `/api/usuarios/{id}` | Desativar |

Exemplo de cadastro:

```json
{
  "nome": "Ana Silva",
  "email": "ana@example.com",
  "senha": "senhaForte123",
  "telefone": "84999990000"
}
```

O model `Usuario` contém somente identificador, nome, e-mail, hash da senha, telefone e indicador de atividade. A API não devolve a senha. O e-mail é único e convertido para minúsculas.

As rotas continuam restritas ao usuário de demonstração `ADMIN` definido em `SecurityConfig`. Esse papel de acesso não é um campo do model `Usuario`. O login dos usuários cadastrados ainda não foi implementado.
