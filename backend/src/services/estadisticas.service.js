import { extremos, moda, promedio, sumar } from "../utils/estadisticas.js";

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

// Arma la estadistica de una semana (lunes a domingo).
//  - tipos:  todos los tipos de culto
//  - cultos: los cultos registrados entre "desde" y "hasta"
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