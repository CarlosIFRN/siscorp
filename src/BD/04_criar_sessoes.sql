CREATE TABLE IF NOT EXISTS sessoes (
    id_sessao BIGSERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    token_hash CHAR(64) NOT NULL UNIQUE,
    criada_em TIMESTAMP WITH TIME ZONE NOT NULL,
    expira_em TIMESTAMP WITH TIME ZONE NOT NULL,
    revogada_em TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_sessoes_usuario ON sessoes(id_usuario);
