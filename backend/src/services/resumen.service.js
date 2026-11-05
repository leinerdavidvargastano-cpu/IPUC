import { promedio, sumar } from "../utils/estadisticas.js";
import { compararListas } from "./estadisticas.service.js";

// Arma el resumen que alimenta las tarjetas del Inicio.
//  - periodos:       lo que devuelve calcularPeriodos
//  - ultimoCulto:    el culto mas reciente de toda la base de datos (o null)
//  - cultos:         los cultos del periodo consultado (hasta hoy si esta en curso)
//  - cultosAnterior: los cultos del periodo anterior equivalente
export function armarResumen({ periodo, periodos, ultimoCulto, cultos, cultosAnterior }) {
  const totales = cultos.map((culto) => culto.total);

  // Suma de una categoria (visitas, ninos...). Sin cultos: null ("sin datos"), no 0.
  const sumaDe = (campo) =>
    cultos.length > 0 ? sumar(cultos.map((culto) => culto[campo])) : null;

  // Agrupamos los cultos por tipo para saber cual reune mas gente EN PROMEDIO.
  const grupos = new Map();
  for (const culto of cultos) {
    const grupo = grupos.get(culto.tipoCultoId) ?? {
      tipoCultoId: culto.tipoCultoId,
      tipoCulto: culto.tipoCulto,
      totales: [],
    };
    grupo.totales.push(culto.total);
    grupos.set(culto.tipoCultoId, grupo);
  }

  const tipos = [...grupos.values()].map((grupo) => ({
    tipoCultoId: grupo.tipoCultoId,
    tipoCulto: grupo.tipoCulto,
    cultos: grupo.totales.length,
    media: sumar(grupo.totales) / grupo.totales.length,
    promedio: promedio(grupo.totales),
  }));

  const mejorMedia = tipos.length > 0 ? Math.max(...tipos.map((tipo) => tipo.media)) : null;

  // Si dos tipos empatan, salen los dos
  const tipoMayorAsistencia = tipos
    .filter((tipo) => tipo.media === mejorMedia)
    .map(({ tipoCultoId, tipoCulto, cultos: cantidad, promedio: prom }) => ({
      tipoCultoId,
      tipoCulto,
      cultos: cantidad,
      promedio: prom,
    }));

  return {
    periodo: {
      tipo: periodo,
      desde: periodos.desde,
      hasta: periodos.hasta,
      hastaEfectivo: periodos.hastaEfectivo,
      enCurso: periodos.enCurso,
    },
    periodoAnterior: periodos.anterior,
    ultimoCulto,
    resumen: {
      cultosRegistrados: cultos.length,
      totalAsistentes: cultos.length > 0 ? sumar(totales) : null,
      promedioPorCulto: promedio(totales),
      visitas: sumaDe("visitas"),
      ninos: sumaDe("ninos"),
      adolescentes: sumaDe("adolescentes"),
    },
    tipoMayorAsistencia,
    comparacion: compararListas(cultos, cultosAnterior),
  };
}