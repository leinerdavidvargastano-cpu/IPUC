-- DATOS INICIALES: la programacion semanal de cultos.
-- dia_semana: 0 = domingo, 1 = lunes ... 6 = sabado
INSERT INTO tipos_culto (nombre, dia_semana, orden) VALUES
  ('Culto dominical (mañana)',     0, 1),
  ('Culto dominical (tarde)',      0, 2),
  ('Culto de martes',              2, 3),
  ('Culto de barrios (miércoles)', 3, 4),
  ('Culto de damas y caballeros',  4, 5),
  ('Culto de barrios (viernes)',   5, 6),
  ('Culto de jóvenes',             6, 7);