CREATE TABLE empresas (
    id_empresa SERIAL PRIMARY KEY,
    nome_empresa VARCHAR(100) NOT NULL,
    cnpj VARCHAR(18) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    email VARCHAR(100)
);

CREATE TABLE cargos (
    id_cargo SERIAL PRIMARY KEY,
    nome_cargo VARCHAR(100) NOT NULL
);

CREATE TABLE tipos_pagamento (
    id_tipo_pagamento SERIAL PRIMARY KEY,
    nome_tipo VARCHAR(50) NOT NULL
);

CREATE TABLE servicos (
    id_servico SERIAL PRIMARY KEY,
    nome_servico VARCHAR(100) NOT NULL,
    valor NUMERIC(10,2) NOT NULL
);

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

CREATE TABLE veiculos (
    id_veiculo SERIAL PRIMARY KEY,
    id_cliente INTEGER NOT NULL,
    modelo_veiculo VARCHAR(100) NOT NULL,
    placa_veiculo VARCHAR(10) NOT NULL UNIQUE,
    CONSTRAINT fk_veiculo_cliente
        FOREIGN KEY (id_cliente)
        REFERENCES clientes(id_cliente)
);

CREATE TABLE agendamentos (
    id_agendamento SERIAL PRIMARY KEY,
    id_veiculo INTEGER NOT NULL,
    data_hora TIMESTAMP NOT NULL,
    status VARCHAR(30) NOT NULL,
    CONSTRAINT fk_agendamento_veiculo
        FOREIGN KEY (id_veiculo)
        REFERENCES veiculos(id_veiculo)
);

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
