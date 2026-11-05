import { esquemaResumen } from "../validators/resumen.validator.js";
import { listarCultosEntre } from "../repositories/estadisticas.repository.js";
import { armarHistorial } from "../services/historial.service.js";
import { calcularPeriodos } from "../utils/periodos.js";
import { hoyEnColombia } from "../utils/estadisticas.js";

// GET /api/estadisticas/historial?periodo=mes&fecha=2026-10-15
//   Mismos filtros que /resumen: periodo, fecha, desde y hasta.
export async function obtenerHistorial(req, res) {
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

  const cultos = await listarCultosEntre(periodos.desde, periodos.hastaEfectivo);

  res.json(armarHistorial({ periodo, periodos, cultos }));
}