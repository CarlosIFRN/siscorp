-- CWOS - Chrono Washing Operational System
-- Banco de dados PostgreSQL
-- Schema inicial do projeto
-- Status: em desenvolvimento
--
-- Este arquivo representa a estrutura atual do banco
-- e poderá sofrer alterações durante o desenvolvimento.

-- ============================================================
-- CWOS - Chrono Washing Operational System
-- Banco de Dados PostgreSQL
-- ============================================================
--
-- ETAPA 01 - CRIAÇÃO DO BANCO DE DADOS
--
-- Execute este arquivo conectado ao servidor PostgreSQL.
-- Depois da criação, conecte-se ao banco "cwos" no DBeaver
-- para executar o arquivo:
--
--     02_criar_tabelas.sql
--
-- ============================================================

CREATE DATABASE cwos;

-- ============================================================
-- CWOS - Chrono Washing Operational System
-- Banco de Dados PostgreSQL
-- ============================================================
--
-- ETAPA 02 - CRIAÇÃO DAS TABELAS
--
-- IMPORTANTE:
-- Este arquivo deve ser executado conectado ao banco "cwos".
--
-- Ordem das tabelas:
-- 1. empresas
-- 2. cargos
-- 3. tipos_pagamento
-- 4. servicos
-- 5. clientes
-- 6. funcionarios
-- 7. veiculos
-- 8. agendamentos
-- 9. ordens_servico
-- 10. ordem_servico_servicos
-- 11. pagamentos
--
-- ============================================================


-- ============================================================
-- 1. EMPRESAS
-- ============================================================

CREATE TABLE empresas (

    id_empresa SERIAL PRIMARY KEY,

    nome_empresa VARCHAR(100) NOT NULL,

    cnpj VARCHAR(18) NOT NULL UNIQUE,

    telefone VARCHAR(20),

    email VARCHAR(100)

);


-- ============================================================
-- 2. CARGOS
-- ============================================================

CREATE TABLE cargos (

    id_cargo SERIAL PRIMARY KEY,

    nome_cargo VARCHAR(100) NOT NULL

);


-- ============================================================
-- 3. TIPOS DE PAGAMENTO
-- ============================================================

CREATE TABLE tipos_pagamento (

    id_tipo_pagamento SERIAL PRIMARY KEY,

    nome_tipo VARCHAR(50) NOT NULL

);


-- ============================================================
-- 4. SERVIÇOS
-- ============================================================

CREATE TABLE servicos (

    id_servico SERIAL PRIMARY KEY,

    nome_servico VARCHAR(100) NOT NULL,

    valor NUMERIC(10,2) NOT NULL

);


-- ============================================================
-- 5. CLIENTES
-- ============================================================

CREATE TABLE clientes (

    id_cliente SERIAL PRIMARY KEY,

    id_empresa INTEGER NOT NULL,

    nome_cliente VARCHAR(100) NOT NULL,

    telefone_cliente VARCHAR(20) NOT NULL,

    email_cliente VARCHAR(100) NOT NULL,

    CONSTRAINT fk_cliente_empresa
        FOREIGN KEY (id_empresa)
        REFERENCES empresas(id_empresa)

);


-- ============================================================
-- 6. FUNCIONÁRIOS
-- ============================================================

CREATE TABLE funcionarios (

    id_funcionario SERIAL PRIMARY KEY,

    id_empresa INTEGER NOT NULL,

    id_cargo INTEGER NOT NULL,

    nome_funcionario VARCHAR(100) NOT NULL,

    telefone_funcionario VARCHAR(20) NOT NULL,

    email_funcionario VARCHAR(100) NOT NULL,

    CONSTRAINT fk_funcionario_empresa
        FOREIGN KEY (id_empresa)
        REFERENCES empresas(id_empresa),

    CONSTRAINT fk_funcionario_cargo
        FOREIGN KEY (id_cargo)
        REFERENCES cargos(id_cargo)

);


-- ============================================================
-- 7. VEÍCULOS
-- ============================================================

CREATE TABLE veiculos (

    id_veiculo SERIAL PRIMARY KEY,

    id_cliente INTEGER NOT NULL,

    modelo_veiculo VARCHAR(100) NOT NULL,

    placa_veiculo VARCHAR(10) NOT NULL UNIQUE,

    CONSTRAINT fk_veiculo_cliente
        FOREIGN KEY (id_cliente)
        REFERENCES clientes(id_cliente)

);


-- ============================================================
-- 8. AGENDAMENTOS
-- ============================================================

CREATE TABLE agendamentos (

    id_agendamento SERIAL PRIMARY KEY,

    id_veiculo INTEGER NOT NULL,

    data_hora TIMESTAMP NOT NULL,

    status VARCHAR(30) NOT NULL,

    CONSTRAINT fk_agendamento_veiculo
        FOREIGN KEY (id_veiculo)
        REFERENCES veiculos(id_veiculo)

);


-- ============================================================
-- 9. ORDENS DE SERVIÇO
-- ============================================================

CREATE TABLE ordens_servico (

    id_ordem_servico SERIAL PRIMARY KEY,

    id_veiculo INTEGER NOT NULL,

    id_funcionario INTEGER,

    data_abertura TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    status VARCHAR(30) NOT NULL,

    CONSTRAINT fk_os_veiculo
        FOREIGN KEY (id_veiculo)
        REFERENCES veiculos(id_veiculo),

    CONSTRAINT fk_os_funcionario
        FOREIGN KEY (id_funcionario)
        REFERENCES funcionarios(id_funcionario)

);


-- ============================================================
-- 10. RELAÇÃO ENTRE ORDENS DE SERVIÇO E SERVIÇOS
-- ============================================================

CREATE TABLE ordem_servico_servicos (

    id_ordem_servico INTEGER NOT NULL,

    id_servico INTEGER NOT NULL,

    quantidade INTEGER NOT NULL DEFAULT 1,

    valor_unitario NUMERIC(10,2) NOT NULL,

    PRIMARY KEY (id_ordem_servico, id_servico),

    CONSTRAINT fk_oss_os
        FOREIGN KEY (id_ordem_servico)
        REFERENCES ordens_servico(id_ordem_servico),

    CONSTRAINT fk_oss_servico
        FOREIGN KEY (id_servico)
        REFERENCES servicos(id_servico)

);


-- ============================================================
-- 11. PAGAMENTOS
-- ============================================================

CREATE TABLE pagamentos (

    id_pagamento SERIAL PRIMARY KEY,

    id_ordem_servico INTEGER NOT NULL,

    id_tipo_pagamento INTEGER NOT NULL,

    valor NUMERIC(10,2) NOT NULL,

    data_pagamento TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_pagamento_os
        FOREIGN KEY (id_ordem_servico)
        REFERENCES ordens_servico(id_ordem_servico),

    CONSTRAINT fk_pagamento_tipo
        FOREIGN KEY (id_tipo_pagamento)
        REFERENCES tipos_pagamento(id_tipo_pagamento)

);


-- ============================================================
-- FIM DA CRIAÇÃO DAS TABELAS
-- ============================================================
