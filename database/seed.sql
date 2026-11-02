-- DATOS INICIALES: la programacion semanal de cultos.
-- dia_semana: 0 = domingo, 1 = lunes ... 6 = sabado


INSERT INTO tipos_culto (nombre, dia_semana, orden) VALUES
  ('Culto de martes',              2, 1),
  ('Culto de barrios (miércoles)', 3, 2),
  ('Culto de damas y caballeros',  4, 3),
  ('Culto de barrios (viernes)',   5, 4),
  ('Culto de jóvenes',             6, 5),
  ('Culto dominical (mañana)',     0, 6),
  ('Culto dominical (tarde)',      0, 7);