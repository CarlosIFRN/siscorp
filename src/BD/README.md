# Banco de Dados — CWOS

O banco de dados do projeto CWOS (Chrono Washing Operational System) utiliza PostgreSQL.

## Estrutura

Os scripts SQL estão organizados na seguinte ordem:

- `01_criar_banco.sql` — criação do banco de dados `cwos`;
- `02_criar_tabelas.sql` — criação das tabelas e seus relacionamentos.
- `03_criar_usuarios.sql` — criação da tabela de usuários para o CRUD.

## Ordem de execução

### 1. Criar o banco

Executar o arquivo:

`01_criar_banco.sql`

Após a criação, conectar-se ao banco `cwos`.

### 2. Criar as tabelas

Com o banco `cwos` selecionado, executar o arquivo:

`02_criar_tabelas.sql`

### 3. Criar a tabela de usuários

Com o banco `cwos` selecionado, executar `03_criar_usuarios.sql`. O script também pode ser executado em um banco já criado com os dois primeiros scripts.

## Tabelas atuais

O modelo atual possui as seguintes tabelas:

- `empresas`
- `cargos`
- `tipos_pagamento`
- `servicos`
- `clientes`
- `funcionarios`
- `veiculos`
- `agendamentos`
- `ordens_servico`
- `ordem_servico_servicos`
- `pagamentos`
- `usuarios`

## Principais relacionamentos

- Uma empresa pode possuir vários clientes.
- Uma empresa pode possuir vários funcionários.
- Um funcionário pertence a um cargo.
- Um cliente pode possuir veículos.
- Um veículo pode possuir agendamentos.
- Um veículo pode possuir ordens de serviço.
- Uma ordem de serviço pode possuir vários serviços.
- Uma ordem de serviço pode possuir pagamentos.
- Cada pagamento possui um tipo de pagamento.

## Observação

O modelo está em desenvolvimento e poderá ser ajustado conforme a definição das funcionalidades da primeira versão do sistema.
