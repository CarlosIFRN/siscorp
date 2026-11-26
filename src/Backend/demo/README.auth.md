# Login e sessões

O login usa o usuário cadastrado em `usuarios`. A senha é conferida com o hash BCrypt já usado pelo projeto. A API emite um JWT de acesso e guarda apenas o hash SHA-256 do refresh token na tabela `sessoes`.

O `AuthenticationManager` valida as credenciais por meio do `UsuarioDetailsService` e do `PasswordEncoder`. O JWT contém `sub`, `iss`, `iat`, `exp` e `roles` com o papel no formato `ROLE_ADMIN`, `ROLE_FUNCIONARIO` ou `ROLE_CLIENTE`. O Resource Server valida o JWT, converte `roles` em `GrantedAuthority` e preenche o `SecurityContextHolder` em cada requisição. As regras de URL e `@PreAuthorize` restringem usuários e agendamentos. Falta de autenticação retorna 401; falta de permissão retorna 403.

## Rotas

| Método | Rota | Uso |
| --- | --- | --- |
| GET | `/api/auth/csrf` | Emite o cookie `XSRF-TOKEN` |
| POST | `/api/auth/login` | Recebe `{"email":"...","senha":"..."}` |
| POST | `/api/auth/refresh` | Renova usando o cookie `CWOS_REFRESH` |
| POST | `/api/auth/logout` | Revoga a sessão e apaga o cookie |
| GET | `/api/auth/me` | Retorna o usuário autenticado |

Antes de cada POST em `/api/auth`, chame `GET /api/auth/csrf` e envie o valor do cookie `XSRF-TOKEN` no cabeçalho `X-XSRF-TOKEN`. O Angular pode fazer isso automaticamente em requisições relativas à mesma origem. O JWT retornado em `accessToken` vai no cabeçalho `Authorization: Bearer <token>` das rotas privadas. Guarde o JWT em memória no navegador.

A apresentação da disciplina desabilita CSRF na API que usa somente o cabeçalho Bearer. Este projeto também recebe o refresh token por cookie, então mantém CSRF nos POSTs de autenticação. O cookie de refresh não autentica as demais rotas da API.

O refresh token é enviado apenas como cookie `HttpOnly`, `SameSite=Strict`, com `Secure` ativado no perfil `db`. Cada renovação revoga o refresh token anterior. O logout revoga o refresh token atual; um JWT de acesso já emitido expira após 15 minutos. Usuários desativados não conseguem usar o JWT nem renovar a sessão.

O perfil `local` tem uma chave de desenvolvimento para iniciar sem configuração extra. Defina `CWOS_JWT_SECRET` com um valor aleatório de ao menos 32 bytes fora do ambiente local. No perfil `db`, execute também `src/BD/04_criar_sessoes.sql` antes de iniciar a API. Esse perfil exige `CWOS_JWT_SECRET`.
