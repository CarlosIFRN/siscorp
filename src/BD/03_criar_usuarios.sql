CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nome_usuario VARCHAR(100) NOT NULL,
    email_usuario VARCHAR(100) NOT NULL UNIQUE,
    senha_usuario VARCHAR(255) NOT NULL,
    cargo VARCHAR(30) NOT NULL,
    telefone_usuario VARCHAR(20),
    endereco_usuario VARCHAR(255),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT ck_usuario_cargo CHECK (cargo IN ('ADMIN', 'FUNCIONARIO', 'CLIENTE'))
);
