// ============================================================
// DATOS DE DEMOSTRACIÓN (FICTICIOS)
// Estos números NO son reales. Se usan solo para ver cómo
// quedará el diseño. En la Fase 7 se reemplazan por los
// cálculos hechos con los registros guardados en la base de datos.
// ============================================================

export const resumenDemo = {
  ultimoCulto: { total: 142, detalle: "Domingo mañana · 25 oct 2026" },
  totalPeriodo: { total: 1126, detalle: "Suma de todos los cultos" },
  promedio: { total: 141, detalle: "Asistentes por culto" },
  mayorAsistencia: { nombre: "Domingo mañana", detalle: "Promedio de 168 asistentes" },
  cantidadCultos: { total: 8, detalle: "Registrados en el período" },
  comparacion: { porcentaje: 6.2, detalle: "Frente al período anterior" },
  visitas: { total: 37, detalle: "Visitas registradas" },
  ninosAdolescentes: { total: 89, detalle: "58 niños y 31 adolescentes" },
};

// Asistencia de una semana de ejemplo (FICTICIA).
// Fíjate que el domingo aparece dos veces: son dos reuniones distintas.
// "etiqueta" es el texto corto del eje X; "nombre" es el nombre completo (para el globo de información).
export const asistenciaSemanalDemo = [
  { etiqueta: "Dom. mañana", nombre: "Culto dominical (mañana)", total: 168 },
  { etiqueta: "Dom. tarde", nombre: "Culto dominical (tarde)", total: 132 },
  { etiqueta: "Martes", nombre: "Culto de martes", total: 74 },
  { etiqueta: "Miércoles", nombre: "Culto de barrios", total: 58 },
  { etiqueta: "Jueves", nombre: "Culto de damas y caballeros", total: 81 },
  { etiqueta: "Viernes", nombre: "Culto de barrios", total: 63 },
  { etiqueta: "Sábado", nombre: "Culto de jóvenes", total: 96 },
];