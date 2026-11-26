CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nome_usuario VARCHAR(100) NOT NULL,
    email_usuario VARCHAR(100) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    tipo_usuario VARCHAR(30) NOT NULL DEFAULT 'Funcionario',
    id_empresa INTEGER,
    CONSTRAINT fk_usuario_empresa FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa)
);
