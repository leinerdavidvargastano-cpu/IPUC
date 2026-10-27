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


// Octubre 2026 agrupado por semanas (FICTICIO).
// "cultos" es cuántas reuniones se registraron en esa semana.
// La semana 5 es incompleta: solo tiene 3 cultos.
export const asistenciaMensualDemo = [
  { nombre: "Semana 1", total: 672, cultos: 7 },
  { nombre: "Semana 2", total: 701, cultos: 7 },
  { nombre: "Semana 3", total: 655, cultos: 7 },
  { nombre: "Semana 4", total: 712, cultos: 7 },
  { nombre: "Semana 5", total: 310, cultos: 3 },
];

// Año 2026 por meses (FICTICIO).
// IMPORTANTE: noviembre y diciembre tienen total: null.
// null significa "sin registros". Es distinto de 0, que significaría
// "se registró un culto y asistieron cero personas".
export const asistenciaAnualDemo = [
  { nombre: "Enero", etiqueta: "Ene", total: 2410, cultos: 26 },
  { nombre: "Febrero", etiqueta: "Feb", total: 2305, cultos: 24 },
  { nombre: "Marzo", etiqueta: "Mar", total: 2560, cultos: 27 },
  { nombre: "Abril", etiqueta: "Abr", total: 2480, cultos: 26 },
  { nombre: "Mayo", etiqueta: "May", total: 2615, cultos: 27 },
  { nombre: "Junio", etiqueta: "Jun", total: 2390, cultos: 25 },
  { nombre: "Julio", etiqueta: "Jul", total: 2700, cultos: 28 },
  { nombre: "Agosto", etiqueta: "Ago", total: 2655, cultos: 27 },
  { nombre: "Septiembre", etiqueta: "Sep", total: 2540, cultos: 26 },
  { nombre: "Octubre", etiqueta: "Oct", total: 3050, cultos: 31 },
  { nombre: "Noviembre", etiqueta: "Nov", total: null, cultos: 0 },
  { nombre: "Diciembre", etiqueta: "Dic", total: null, cultos: 0 },
];

// Total de los mismos meses del año anterior (FICTICIO), para comparar.
export const anioAnteriorDemo = { total: 23890 };




// Tipos de culto de DEMOSTRACIÓN. Más adelante saldrán de la tabla
// "tipos_culto" de la base de datos, para poder configurarlos sin tocar el código.
// Fíjate que el domingo tiene dos tipos distintos: mañana y tarde.
export const tiposCultoDemo = [
  { id: "dom-manana", nombre: "Culto dominical (mañana)" },
  { id: "dom-tarde", nombre: "Culto dominical (tarde)" },
  { id: "martes", nombre: "Culto de martes" },
  { id: "miercoles", nombre: "Culto de barrios (miércoles)" },
  { id: "jueves", nombre: "Culto de damas y caballeros" },
  { id: "viernes", nombre: "Culto de barrios (viernes)" },
  { id: "sabado", nombre: "Culto de jóvenes" },
];




// REGISTROS DE DEMOSTRACIÓN (FICTICIOS) para la tabla "Ver datos".
// Fíjate en dos cosas:
// 1) No guardamos el "total": se calcula sumando las cuatro categorías.
// 2) ofrenda: null significa "no se registró", que es distinto de 0.
export const registrosDemo = [
  { id: 1, fecha: "2026-10-25", tipoCultoId: "dom-manana", hermanos: 118, visitas: 12, ninos: 21, adolescentes: 11, ofrenda: 1250000, dirigio: "Persona demo A", predico: "Persona demo B", lema: "Lema de demostración", tema: "Tema de demostración", observaciones: "Registro ficticio de ejemplo.", registradoPor: "Secretario Demo" },
  { id: 2, fecha: "2026-10-25", tipoCultoId: "dom-tarde", hermanos: 96, visitas: 8, ninos: 14, adolescentes: 9, ofrenda: 780000, dirigio: "Persona demo C", predico: "Persona demo B", lema: "", tema: "", observaciones: "", registradoPor: "Secretario Demo" },
  { id: 3, fecha: "2026-10-24", tipoCultoId: "sabado", hermanos: 61, visitas: 9, ninos: 6, adolescentes: 15, ofrenda: null, dirigio: "", predico: "", lema: "", tema: "", observaciones: "", registradoPor: "Secretario Demo" },
  { id: 4, fecha: "2026-10-23", tipoCultoId: "viernes", hermanos: 44, visitas: 5, ninos: 3, adolescentes: 4, ofrenda: 210000, dirigio: "", predico: "", lema: "", tema: "", observaciones: "", registradoPor: "Secretario Demo" },
  { id: 5, fecha: "2026-10-22", tipoCultoId: "jueves", hermanos: 58, visitas: 6, ninos: 4, adolescentes: 3, ofrenda: 340000, dirigio: "", predico: "", lema: "", tema: "", observaciones: "", registradoPor: "Secretario Demo" },
  { id: 6, fecha: "2026-10-21", tipoCultoId: "miercoles", hermanos: 40, visitas: 7, ninos: 5, adolescentes: 2, ofrenda: null, dirigio: "", predico: "", lema: "", tema: "", observaciones: "", registradoPor: "Secretario Demo" },
  { id: 7, fecha: "2026-10-20", tipoCultoId: "martes", hermanos: 52, visitas: 4, ninos: 6, adolescentes: 3, ofrenda: 190000, dirigio: "", predico: "", lema: "", tema: "", observaciones: "", registradoPor: "Secretario Demo" },
  { id: 8, fecha: "2026-10-18", tipoCultoId: "dom-manana", hermanos: 121, visitas: 15, ninos: 19, adolescentes: 10, ofrenda: 1310000, dirigio: "", predico: "", lema: "", tema: "", observaciones: "", registradoPor: "Secretario Demo" },
  { id: 9, fecha: "2026-10-18", tipoCultoId: "dom-tarde", hermanos: 99, visitas: 6, ninos: 13, adolescentes: 8, ofrenda: 820000, dirigio: "", predico: "", lema: "", tema: "", observaciones: "", registradoPor: "Secretario Demo" },
  { id: 10, fecha: "2026-09-27", tipoCultoId: "dom-manana", hermanos: 112, visitas: 10, ninos: 18, adolescentes: 9, ofrenda: 1100000, dirigio: "", predico: "", lema: "", tema: "", observaciones: "", registradoPor: "Secretario Demo" },
  { id: 11, fecha: "2026-09-26", tipoCultoId: "sabado", hermanos: 57, visitas: 11, ninos: 5, adolescentes: 12, ofrenda: null, dirigio: "", predico: "", lema: "", tema: "", observaciones: "", registradoPor: "Secretario Demo" },
  { id: 12, fecha: "2025-12-21", tipoCultoId: "dom-manana", hermanos: 130, visitas: 22, ninos: 25, adolescentes: 14, ofrenda: 1480000, dirigio: "", predico: "", lema: "", tema: "", observaciones: "", registradoPor: "Secretario Demo" },
];