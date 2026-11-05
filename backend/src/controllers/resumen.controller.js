import { esquemaResumen } from "../validators/resumen.validator.js";
import {
  listarCultosEntre,
  obtenerUltimoCulto,
} from "../repositories/estadisticas.repository.js";
import { armarResumen } from "../services/resumen.service.js";
import { calcularPeriodos } from "../utils/periodos.js";
import { hoyEnColombia } from "../utils/estadisticas.js";

// GET /api/estadisticas/resumen?periodo=mes&fecha=2026-10-15
//   periodo: semana | mes | anio | rango   (sin el, "mes")
//   fecha:   cualquier dia del periodo      (sin ella, hoy)
//   desde y hasta: solo para "rango"
export async function obtenerResumen(req, res) {
  const validacion = esquemaResumen.safeParse(req.query);

  if (!validacion.success) {
    return res.status(400).json({
      mensaje: "Filtros inválidos",
      errores: validacion.error.issues.map((problema) => ({
        campo: problema.path.join("."),
        mensaje: problema.message,
      })),
    });
  }

  const hoy = hoyEnColombia();
  const periodo = validacion.data.periodo ?? "mes";

  const periodos = calcularPeriodos({
    periodo,
    fecha: validacion.data.fecha,
    desde: validacion.data.desde,
    hasta: validacion.data.hasta,
    hoy,
  });

  // Tres consultas a la vez: el periodo, el periodo anterior y el ultimo culto
  const [cultos, cultosAnterior, ultimoCulto] = await Promise.all([
    listarCultosEntre(periodos.desde, periodos.hastaEfectivo),
    listarCultosEntre(periodos.anterior.desde, periodos.anterior.hasta),
    obtenerUltimoCulto(),
  ]);

  res.json(armarResumen({ periodo, periodos, ultimoCulto, cultos, cultosAnterior }));
}