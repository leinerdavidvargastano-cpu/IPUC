-- ============================================================
-- ESQUEMA DE LA BASE DE DATOS: Sistema de Asistencia IPUC
-- Todo va dentro de una transaccion (BEGIN ... COMMIT):
-- o se crean todas las tablas, o no se crea ninguna.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- USUARIOS: los secretarios autorizados
-- ------------------------------------------------------------
CREATE TABLE usuarios (
  -- GENERATED ALWAYS AS IDENTITY: PostgreSQL numera solo (1, 2, 3...)
  id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre_completo VARCHAR(150) NOT NULL,
  email           VARCHAR(254) NOT NULL,
  -- Nunca se guarda la contrasena: solo su "hash" (huella irreversible)
  password_hash   TEXT NOT NULL,
  rol             VARCHAR(20) NOT NULL DEFAULT 'secretario'
                  CHECK (rol IN ('admin', 'secretario')),
  activo          BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- El correo no se puede repetir, sin importar mayusculas o minusculas
CREATE UNIQUE INDEX usuarios_email_unico ON usuarios (LOWER(email));

-- ------------------------------------------------------------
-- INVITACIONES: permiso de un solo uso para crear una cuenta
-- ------------------------------------------------------------
CREATE TABLE invitaciones (
  id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email       VARCHAR(254) NOT NULL,
  -- Se guarda el hash del codigo, no el codigo mismo
  token_hash  TEXT NOT NULL UNIQUE,
  rol         VARCHAR(20) NOT NULL DEFAULT 'secretario'
              CHECK (rol IN ('admin', 'secretario')),
  expira_en   TIMESTAMPTZ NOT NULL,
  usada_en    TIMESTAMPTZ,  -- NULL = todavia no se ha usado
  -- REFERENCES: clave foranea. Esta columna solo acepta ids que existan en usuarios
  creada_por  INTEGER NOT NULL REFERENCES usuarios (id),
  creada_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- TIPOS DE CULTO: la programacion semanal, configurable
-- ------------------------------------------------------------
CREATE TABLE tipos_culto (
  id          SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL UNIQUE,
  -- 0 = domingo, 1 = lunes ... 6 = sabado
  dia_semana  SMALLINT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  -- Orden en que aparecen en formularios y graficas
  orden       SMALLINT NOT NULL,
  activo      BOOLEAN NOT NULL DEFAULT TRUE
);

-- ------------------------------------------------------------
-- CULTOS: cada registro de asistencia
-- ------------------------------------------------------------
CREATE TABLE cultos (
  id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fecha           DATE NOT NULL,
  tipo_culto_id   SMALLINT NOT NULL REFERENCES tipos_culto (id),

  -- Las cuatro categorias: enteros de cero en adelante
  hermanos        INTEGER NOT NULL CHECK (hermanos >= 0),
  visitas         INTEGER NOT NULL CHECK (visitas >= 0),
  ninos           INTEGER NOT NULL CHECK (ninos >= 0),
  adolescentes    INTEGER NOT NULL CHECK (adolescentes >= 0),

  -- Columna calculada por PostgreSQL: es imposible que quede
  -- distinta de la suma de las cuatro categorias
  total_asistentes INTEGER GENERATED ALWAYS AS
                   (hermanos + visitas + ninos + adolescentes) STORED,

  -- Datos opcionales. NULL significa "no se registro" (distinto de 0)
  ofrenda_cop     BIGINT CHECK (ofrenda_cop >= 0),
  dirigio         VARCHAR(100),
  predico         VARCHAR(100),
  lema            VARCHAR(150),
  tema            VARCHAR(150),
  observaciones   VARCHAR(500),

  -- Quien lo registro y quien lo modifico
  creado_por      INTEGER NOT NULL REFERENCES usuarios (id),
  modificado_por  INTEGER REFERENCES usuarios (id),
  creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modificado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Borrado logico: el registro se "oculta" pero no se pierde
  eliminado_en    TIMESTAMPTZ,
  eliminado_por   INTEGER REFERENCES usuarios (id)
);

-- Evita registrar dos veces el mismo tipo de culto en la misma fecha.
-- Dos cultos distintos el mismo domingo SI se permiten (tienen distinto tipo).
-- El "WHERE eliminado_en IS NULL" hace que un registro eliminado no estorbe
-- si despues se vuelve a registrar ese culto.
CREATE UNIQUE INDEX cultos_fecha_tipo_unico
  ON cultos (fecha, tipo_culto_id)
  WHERE eliminado_en IS NULL;

-- Indices para que las consultas por fecha y por tipo sean rapidas
CREATE INDEX cultos_fecha_idx ON cultos (fecha);
CREATE INDEX cultos_tipo_fecha_idx ON cultos (tipo_culto_id, fecha);

-- ------------------------------------------------------------
-- AUDITORIA: historial de operaciones importantes
-- ------------------------------------------------------------
CREATE TABLE auditoria (
  id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario_id     INTEGER REFERENCES usuarios (id),
  accion         VARCHAR(20) NOT NULL
                 CHECK (accion IN ('crear', 'editar', 'eliminar')),
  entidad        VARCHAR(30) NOT NULL,   -- por ejemplo 'culto'
  entidad_id     INTEGER,
  -- JSONB guarda un objeto: como estaba antes y como quedo despues
  datos_antes    JSONB,
  datos_despues  JSONB,
  fecha          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX auditoria_entidad_idx ON auditoria (entidad, entidad_id);

COMMIT;