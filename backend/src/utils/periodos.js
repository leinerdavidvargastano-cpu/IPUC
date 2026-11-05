import {
  diasEntre,
  inicioDeSemana,
  primerDiaDelMes,
  sumarDias,
  ultimoDiaDelMes,
} from "./estadisticas.js";

// La menor de dos fechas "AAAA-MM-DD" (se pueden comparar como texto)
const menor = (a, b) => (a < b ? a : b);

// Calcula el periodo consultado y el periodo anterior equivalente.
//  - periodo: "semana", "mes", "anio" o "rango"
//  - fecha:   cualquier dia dentro de la semana, mes o anio (no se usa en "rango")
//  - desde, hasta: solo para "rango"
//  - hoy:     fecha de hoy, para saber si el periodo todavia esta en curso
export function calcularPeriodos({ periodo, fecha, desde, hasta, hoy }) {
  const [anio, mes] = (fecha ?? hoy).split("-").map(Number);

  let inicio;
  let fin;
  let inicioAnterior;
  let finAnterior;

  if (periodo === "semana") {
    inicio = inicioDeSemana(fecha ?? hoy);
    fin = sumarDias(inicio, 6);
    inicioAnterior = sumarDias(inicio, -7);
    finAnterior = sumarDias(inicioAnterior, 6);
  } else if (periodo === "mes") {
    inicio = primerDiaDelMes(anio, mes);
    fin = ultimoDiaDelMes(anio, mes);
    // El mes anterior (si es enero, diciembre del anio pasado)
    const anioAnterior = mes === 1 ? anio - 1 : anio;
    const mesAnterior = mes === 1 ? 12 : mes - 1;
    inicioAnterior = primerDiaDelMes(anioAnterior, mesAnterior);
    finAnterior = ultimoDiaDelMes(anioAnterior, mesAnterior);
  } else if (periodo === "anio") {
    inicio = `${anio}-01-01`;
    fin = `${anio}-12-31`;
    inicioAnterior = `${anio - 1}-01-01`;
    finAnterior = `${anio - 1}-12-31`;
  } else {
    // "rango": el periodo anterior dura lo mismo y termina justo antes
    inicio = desde;
    fin = hasta;
    const duracion = diasEntre(inicio, fin) + 1;
    inicioAnterior = sumarDias(inicio, -duracion);
    finAnterior = sumarDias(inicio, -1);
  }

  // En curso: hoy cae dentro del periodo y todavia no es su ultimo dia
  const enCurso = hoy >= inicio && hoy < fin;
  const hastaEfectivo = enCurso ? hoy : fin;

  // El periodo anterior se corta tras la misma cantidad de dias transcurridos
  const transcurridos = diasEntre(inicio, hastaEfectivo);
  const hastaAnterior = menor(finAnterior, sumarDias(inicioAnterior, transcurridos));

  return {
    desde: inicio,
    hasta: fin,
    hastaEfectivo,
    enCurso,
    anterior: { desde: inicioAnterior, hasta: hastaAnterior },
  };
}