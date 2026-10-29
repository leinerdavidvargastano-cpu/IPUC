-- Migracion 001: tabla de sesiones (inicio de sesion)
BEGIN;

CREATE TABLE sesiones (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  -- Si se elimina un usuario, sus sesiones se eliminan con el
  usuario_id  INTEGER NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
  -- Se guarda la huella (hash) del codigo de sesion, nunca el codigo
  token_hash  TEXT NOT NULL UNIQUE,
  creada_en   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expira_en   TIMESTAMPTZ NOT NULL
);

CREATE INDEX sesiones_usuario_idx ON sesiones (usuario_id);
CREATE INDEX sesiones_expira_idx ON sesiones (expira_en);

COMMIT;