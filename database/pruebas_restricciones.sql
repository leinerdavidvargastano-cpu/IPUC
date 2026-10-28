-- ============================================================
-- PRUEBAS DE LAS REGLAS DE LA BASE DE DATOS
-- Todo se ejecuta dentro de una transaccion que termina en
-- ROLLBACK: al final no queda ningun dato de prueba.
-- SAVEPOINT marca un punto al que podemos volver despues de un
-- error, sin perder lo anterior.
-- ============================================================

BEGIN;

INSERT INTO usuarios (nombre_completo, email, password_hash)
VALUES ('Usuario de prueba', 'prueba@ejemplo.com', 'no-es-un-hash-real');

-- PRUEBA 1: registro valido (domingo manana). DEBE FUNCIONAR.
INSERT INTO cultos (fecha, tipo_culto_id, hermanos, visitas, ninos, adolescentes, creado_por)
VALUES ('2026-10-25',
        (SELECT id FROM tipos_culto WHERE orden = 1),
        118, 12, 21, 11,
        (SELECT id FROM usuarios WHERE email = 'prueba@ejemplo.com'));

-- El total debe salir 162 (118 + 12 + 21 + 11), calculado por PostgreSQL
SELECT fecha, hermanos, visitas, ninos, adolescentes, total_asistentes FROM cultos;

-- PRUEBA 2: el MISMO domingo, pero culto de la tarde. DEBE FUNCIONAR.
INSERT INTO cultos (fecha, tipo_culto_id, hermanos, visitas, ninos, adolescentes, creado_por)
VALUES ('2026-10-25',
        (SELECT id FROM tipos_culto WHERE orden = 2),
        96, 8, 14, 9,
        (SELECT id FROM usuarios WHERE email = 'prueba@ejemplo.com'));

-- PRUEBA 3: repetir el culto de la manana del mismo dia. DEBE FALLAR (duplicado).
SAVEPOINT prueba;
INSERT INTO cultos (fecha, tipo_culto_id, hermanos, visitas, ninos, adolescentes, creado_por)
VALUES ('2026-10-25',
        (SELECT id FROM tipos_culto WHERE orden = 1),
        50, 5, 5, 5,
        (SELECT id FROM usuarios WHERE email = 'prueba@ejemplo.com'));
ROLLBACK TO prueba;

-- PRUEBA 4: numero negativo de hermanos. DEBE FALLAR.
SAVEPOINT prueba;
INSERT INTO cultos (fecha, tipo_culto_id, hermanos, visitas, ninos, adolescentes, creado_por)
VALUES ('2026-10-27',
        (SELECT id FROM tipos_culto WHERE orden = 3),
        -5, 1, 1, 1,
        (SELECT id FROM usuarios WHERE email = 'prueba@ejemplo.com'));
ROLLBACK TO prueba;

-- PRUEBA 5: intentar escribir el total a mano. DEBE FALLAR (lo calcula la base).
SAVEPOINT prueba;
INSERT INTO cultos (fecha, tipo_culto_id, hermanos, visitas, ninos, adolescentes, total_asistentes, creado_por)
VALUES ('2026-10-27',
        (SELECT id FROM tipos_culto WHERE orden = 3),
        1, 1, 1, 1, 999,
        (SELECT id FROM usuarios WHERE email = 'prueba@ejemplo.com'));
ROLLBACK TO prueba;

-- PRUEBA 6: registrar un culto a nombre de un usuario que no existe. DEBE FALLAR.
SAVEPOINT prueba;
INSERT INTO cultos (fecha, tipo_culto_id, hermanos, visitas, ninos, adolescentes, creado_por)
VALUES ('2026-10-27',
        (SELECT id FROM tipos_culto WHERE orden = 3),
        1, 1, 1, 1, 9999);
ROLLBACK TO prueba;

-- PRUEBA 7: el mismo correo con otras mayusculas. DEBE FALLAR.
SAVEPOINT prueba;
INSERT INTO usuarios (nombre_completo, email, password_hash)
VALUES ('Otro usuario', 'PRUEBA@EJEMPLO.COM', 'no-es-un-hash-real');
ROLLBACK TO prueba;

-- Descartamos TODO lo de esta transaccion
ROLLBACK;

-- Comprobacion final: las tablas deben haber quedado vacias
SELECT COUNT(*) AS usuarios FROM usuarios;
SELECT COUNT(*) AS cultos FROM cultos;