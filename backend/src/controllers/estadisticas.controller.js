import {
  esquemaSemanal,
  esquemaMensual,
  esquemaAnual,
} from "../validators/estadisticas.validator.js";
import {
  listarTiposCulto,
  listarCultosEntre,
} from "../repositories/estadisticas.repository.js";
import { armarSemanal, armarMensual, armarAnual } from "../services/estadisticas.service.js";
import {
  hoyEnColombia,
  inicioDeSemana,
  sumarDias,
  primerDiaDelMes,
  ultimoDiaDelMes,
  semanasDelMes,
} from "../utils/estadisticas.js";

// Convierte los problemas de zod en una lista sencilla para el frontend
function listaDeErrores(validacion) {
  return validacion.error.issues.map((problema) => ({
    campo: problema.path.join("."),
    mensaje: problema.message,
  }));
}

// GET /api/estadisticas/semanal?fecha=2026-10-21
export async function obtenerSemanal(req, res) {
  const validacion = esquemaSemanal.safeParse(req.query);

  if (!validacion.success) {
    return res
      .status(400)
      .json({ mensaje: "Filtros inválidos", errores: listaDeErrores(validacion) });
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

// GET /api/estadisticas/mensual?anio=2026&mes=10
export async function obtenerMensual(req, res) {
  const validacion = esquemaMensual.safeParse(req.query);

  if (!validacion.success) {
    return res
      .status(400)
      .json({ mensaje: "Filtros inválidos", errores: listaDeErrores(validacion) });
  }

  // Lo que falte se completa con el mes actual (en hora de Colombia)
  const hoy = hoyEnColombia();
  const anio = validacion.data.anio ?? Number(hoy.slice(0, 4));
  const mes = validacion.data.mes ?? Number(hoy.slice(5, 7));

  const desde = primerDiaDelMes(anio, mes);
  const hasta = ultimoDiaDelMes(anio, mes);

  const cultos = await listarCultosEntre(desde, hasta);

  res.json(
    armarMensual({
      anio,
      mes,
      desde,
      hasta,
      semanas: semanasDelMes(anio, mes),
      cultos,
    })
  );
}

// GET /api/estadisticas/anual?anio=2026
export async function obtenerAnual(req, res) {
  const validacion = esquemaAnual.safeParse(req.query);

  if (!validacion.success) {
    return res
      .status(400)
      .json({ mensaje: "Filtros inválidos", errores: listaDeErrores(validacion) });
  }

  const hoy = hoyEnColombia();
  const anio = validacion.data.anio ?? Number(hoy.slice(0, 4));

  // Se piden los cultos del anio y los del anio anterior (para comparar)
  const [cultos, cultosAnterior] = await Promise.all([
    listarCultosEntre(`${anio}-01-01`, `${anio}-12-31`),
    listarCultosEntre(`${anio - 1}-01-01`, `${anio - 1}-12-31`),
  ]);

  res.json(armarAnual({ anio, hoy, cultos, cultosAnterior }));
}