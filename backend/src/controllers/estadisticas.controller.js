import { esquemaSemanal } from "../validators/estadisticas.validator.js";
import {
  listarTiposCulto,
  listarCultosEntre,
} from "../repositories/estadisticas.repository.js";
import { armarSemanal } from "../services/estadisticas.service.js";
import { hoyEnColombia, inicioDeSemana, sumarDias } from "../utils/estadisticas.js";

// GET /api/estadisticas/semanal?fecha=2026-10-21
export async function obtenerSemanal(req, res) {
  const validacion = esquemaSemanal.safeParse(req.query);

  if (!validacion.success) {
    return res.status(400).json({
      mensaje: "Filtros inválidos",
      errores: validacion.error.issues.map((problema) => ({
        campo: problema.path.join("."),
        mensaje: problema.message,
      })),
    });
  }

  // Sin fecha: la semana actual
  const fecha = validacion.data.fecha ?? hoyEnColombia();

  // La semana va de lunes a domingo
  const desde = inicioDeSemana(fecha);
  const hasta = sumarDias(desde, 6);

  // Promise.all hace las dos consultas al mismo tiempo
  const [tipos, cultos] = await Promise.all([
    listarTiposCulto(),
    listarCultosEntre(desde, hasta),
  ]);

  res.json(armarSemanal({ desde, hasta, tipos, cultos }));
}