import { extremos, promedio } from "../utils/estadisticas.js";

// Arma la serie "dia por dia" para la grafica general.
//  - periodos: lo que devuelve calcularPeriodos
//  - cultos:   los cultos del periodo (ya ordenados por fecha)
// Solo salen los dias QUE TUVIERON culto: un dia sin registro no es un punto en cero.
export function armarHistorial({ periodo, periodos, cultos }) {
  // Agrupamos los cultos por fecha. Dos cultos el mismo dia (el domingo)
  // forman UN solo punto, con el total sumado.
  const porDia = new Map();

  for (const culto of cultos) {
    const dia = porDia.get(culto.fecha) ?? { fecha: culto.fecha, total: 0, cultos: [] };

    dia.total += culto.total;
    dia.cultos.push({
      id: culto.id,
      tipoCultoId: culto.tipoCultoId,
      tipoCulto: culto.tipoCulto,
      total: culto.total,
    });

    porDia.set(culto.fecha, dia);
  }

  const puntos = [...porDia.values()];
  const { mayor, menor } = extremos(puntos);

  return {
    periodo: {
      tipo: periodo,
      desde: periodos.desde,
      hasta: periodos.hasta,
      hastaEfectivo: periodos.hastaEfectivo,
      enCurso: periodos.enCurso,
    },
    puntos,
    resumen: {
      diasConCulto: puntos.length,
      cultosRegistrados: cultos.length,
      // Sin dias con culto: null ("sin datos"), no 0
      promedioPorDia: promedio(puntos.map((punto) => punto.total)),
      mayorDia: mayor.map(({ fecha, total }) => ({ fecha, total })),
      menorDia: menor.map(({ fecha, total }) => ({ fecha, total })),
    },
  };
}