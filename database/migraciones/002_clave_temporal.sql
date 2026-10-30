-- Migracion 002: marca de "debe cambiar la contrasena"
BEGIN;

ALTER TABLE usuarios
  ADD COLUMN debe_cambiar_clave BOOLEAN NOT NULL DEFAULT FALSE;

COMMIT;