# Banco de Dados — CWOS

O banco de dados atual utiliza PostgreSQL. Os scripts são executados manualmente, nesta ordem:

1. `01_criar_banco.sql`: cria o banco `cwos`.
2. `02_criar_tabelas.sql`: cria as tabelas operacionais.
3. `03_criar_usuarios.sql`: cria a tabela de usuários para o CRUD.

Em uma instalação que já executou os dois primeiros scripts, execute apenas `03_criar_usuarios.sql`.
A API está configurada com `spring.jpa.hibernate.ddl-auto=none`, portanto não cria a tabela automaticamente.

O modelo operacional antigo ainda possui `clientes`, `funcionarios` e `cargos`.
O novo `Usuario` reúne identidade, senha e perfil (`ADMIN`, `FUNCIONARIO` ou `CLIENTE`).
A ligação dos registros operacionais antigos com `usuarios` será feita em uma etapa posterior.
