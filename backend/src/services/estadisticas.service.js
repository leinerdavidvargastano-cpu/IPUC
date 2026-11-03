import { extremos, moda, promedio, sumar, ultimoDiaDelMes } from "../utils/estadisticas.js";
import { diferenciaPorcentual, mismaFechaAnioAnterior } from "../utils/comparaciones.js";

const NOMBRES_MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

// Version corta de un culto, para indicar "cual fue el mayor / el menor"
function referencia(culto) {
  return {
    id: culto.id,
    fecha: culto.fecha,
    tipoCultoId: culto.tipoCultoId,
    tipoCulto: culto.tipoCulto,
    total: culto.total,
  };
}

// Version corta de una semana
function referenciaSemana(semana) {
  return {
    numero: semana.numero,
    desde: semana.desde,
    hasta: semana.hasta,
    total: semana.total,
  };
}

// Version corta de un mes
function referenciaMes(mes) {
  return { mes: mes.mes, nombre: mes.nombre, total: mes.total };
}

// ------------------------------------------------------------
// Semana (lunes a domingo)
//  - tipos:  todos los tipos de culto
//  - cultos: los cultos registrados entre "desde" y "hasta"
// ------------------------------------------------------------
export function armarSemanal({ desde, hasta, tipos, cultos }) {
  // Una "reunion" por cada tipo de culto de la semana. Si no se registro,
  // su lista de cultos queda vacia: eso es "sin registro", no "cero".
  const reuniones = tipos
    .filter((tipo) => tipo.activo || cultos.some((culto) => culto.tipoCultoId === tipo.id))
    .map((tipo) => ({
      tipoCultoId: tipo.id,
      tipoCulto: tipo.nombre,
      diaSemana: tipo.diaSemana,
      orden: tipo.orden,
      cultos: cultos
        .filter((culto) => culto.tipoCultoId === tipo.id)
        .map((culto) => ({ id: culto.id, fecha: culto.fecha, total: culto.total })),
    }));

  // La moda y el promedio se calculan sobre la asistencia de CADA culto
  const totales = cultos.map((culto) => culto.total);
  const { mayor, menor } = extremos(cultos);

  return {
    desde,
    hasta,
    reuniones,
    resumen: {
      cultosRegistrados: cultos.length,
      // Sin cultos: null ("sin datos"), no 0
      totalAcumulado: cultos.length > 0 ? sumar(totales) : null,
      promedioPorCulto: promedio(totales),
      moda: moda(totales),
      mayor: mayor.map(referencia),
      menor: menor.map(referencia),
    },
  };
}

// ------------------------------------------------------------
// Mes, por semanas
//  - semanas: las semanas del mes (ya recortadas, ver semanasDelMes)
//  - cultos:  los cultos registrados dentro del mes
// ------------------------------------------------------------
export function armarMensual({ anio, mes, desde, hasta, semanas, cultos }) {
  // A cada semana le ponemos sus cultos y su total.
  // Cada culto cae en UNA sola semana, porque las semanas dividen el mes sin solaparse.
  const semanasConDatos = semanas.map((semana) => {
    const delaSemana = cultos.filter(
      (culto) => culto.fecha >= semana.desde && culto.fecha <= semana.hasta
    );

    return {
      ...semana,
      cultosRegistrados: delaSemana.length,
      // Sin cultos: null ("sin registros"), no 0
      total: delaSemana.length > 0 ? sumar(delaSemana.map((culto) => culto.total)) : null,
    };
  });

  // Todos los cultos del mes (parciales incluidos)
  const totales = cultos.map((culto) => culto.total);

  // Para comparar semanas de forma justa: solo las COMPLETAS que tienen registros
  const completas = semanasConDatos.filter((semana) => !semana.parcial && semana.total !== null);
  const totalesSemanales = completas.map((semana) => semana.total);

  const mayorTotal = completas.length > 0 ? Math.max(...totalesSemanales) : null;
  const menorTotal = completas.length > 0 ? Math.min(...totalesSemanales) : null;

  return {
    anio,
    mes,
    desde,
    hasta,
    semanas: semanasConDatos,
    resumen: {
      cultosRegistrados: cultos.length,
      totalAcumulado: cultos.length > 0 ? sumar(totales) : null,
      promedioPorCulto: promedio(totales),
      moda: moda(totales),
      // Estos tres hablan de SEMANAS completas, no de cultos
      semanasCompletasConRegistros: completas.length,
      promedioDelTotalSemanal: promedio(totalesSemanales),
      semanaMayor: completas.filter((s) => s.total === mayorTotal).map(referenciaSemana),
      semanaMenor: completas.filter((s) => s.total === menorTotal).map(referenciaSemana),
    },
  };
}

// Totales de dos listas de cultos y su diferencia. Una lista vacia es "sin datos" (null).
function compararListas(actual, anterior) {
  const totalActual = actual.length > 0 ? sumar(actual.map((culto) => culto.total)) : null;
  const totalAnterior = anterior.length > 0 ? sumar(anterior.map((culto) => culto.total)) : null;

  return {
    cultosActual: actual.length,
    cultosAnterior: anterior.length,
    totalActual,
    totalAnterior,
    diferencia: totalActual !== null && totalAnterior !== null ? totalActual - totalAnterior : null,
    porcentaje: diferenciaPorcentual(totalActual, totalAnterior),
  };
}

// ------------------------------------------------------------
// Anio, por meses
//  - hoy:           fecha de hoy ("AAAA-MM-DD"), para saber que meses ya terminaron
//  - cultos:        los cultos del anio consultado
//  - cultosAnterior: los cultos del anio anterior
// ------------------------------------------------------------
export function armarAnual({ anio, hoy, cultos, cultosAnterior }) {
  const meses = NOMBRES_MESES.map((nombre, indice) => {
    const mes = indice + 1;
    const prefijo = `${anio}-${String(mes).padStart(2, "0")}-`;
    const delMes = cultos.filter((culto) => culto.fecha.startsWith(prefijo));

    return {
      mes,
      nombre,
      cultosRegistrados: delMes.length,
      // Sin cultos: null ("sin registros"), no 0
      total: delMes.length > 0 ? sumar(delMes.map((culto) => culto.total)) : null,
      // Un mes "terminado" es uno cuyo ultimo dia ya paso
      terminado: ultimoDiaDelMes(anio, mes) < hoy,
    };
  });

  // Todos los cultos del anio
  const totales = cultos.map((culto) => culto.total);

  // Para comparar meses de forma justa: solo los TERMINADOS que tienen registros
  const completos = meses.filter((mes) => mes.terminado && mes.total !== null);
  const totalesMensuales = completos.map((mes) => mes.total);

  const mayorTotal = completos.length > 0 ? Math.max(...totalesMensuales) : null;
  const menorTotal = completos.length > 0 ? Math.min(...totalesMensuales) : null;

  // ----- Comparacion con el anio anterior -----
  const anioAnterior = anio - 1;

  // Mismo periodo: del 1 de enero hasta hoy (si el anio esta en curso),
  // o el anio entero (si ya termino). El anio anterior se corta en la misma fecha.
  const desdeActual = `${anio}-01-01`;
  const finDeAnio = `${anio}-12-31`;
  const hastaActual = hoy >= desdeActual && hoy < finDeAnio ? hoy : finDeAnio;
  const desdeAnterior = `${anioAnterior}-01-01`;
  const hastaAnterior = mismaFechaAnioAnterior(hastaActual);

  const actualEnPeriodo = cultos.filter(
    (culto) => culto.fecha >= desdeActual && culto.fecha <= hastaActual
  );
  const anteriorEnPeriodo = cultosAnterior.filter(
    (culto) => culto.fecha >= desdeAnterior && culto.fecha <= hastaAnterior
  );

  return {
    anio,
    meses,
    resumen: {
      cultosRegistrados: cultos.length,
      totalAcumulado: cultos.length > 0 ? sumar(totales) : null,
      promedioPorCulto: promedio(totales),
      moda: moda(totales),
      // Estos hablan de MESES terminados, no de cultos
      mesesTerminadosConRegistros: completos.length,
      promedioDelTotalMensual: promedio(totalesMensuales),
      mesMayor: completos.filter((mes) => mes.total === mayorTotal).map(referenciaMes),
      mesMenor: completos.filter((mes) => mes.total === menorTotal).map(referenciaMes),
    },
    comparacion: {
      anioAnterior,
      mismoPeriodo: {
        desde: desdeActual,
        hasta: hastaActual,
        desdeAnterior,
        hastaAnterior,
        ...compararListas(actualEnPeriodo, anteriorEnPeriodo),
      },
      anioCompleto: compararListas(cultos, cultosAnterior),
    },
  };
}