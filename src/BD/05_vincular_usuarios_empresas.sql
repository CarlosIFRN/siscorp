ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS id_empresa INTEGER;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_usuario_empresa'
          AND conrelid = 'usuarios'::regclass
    ) THEN
        ALTER TABLE usuarios
            ADD CONSTRAINT fk_usuario_empresa
            FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa);
    END IF;
END
$$;
