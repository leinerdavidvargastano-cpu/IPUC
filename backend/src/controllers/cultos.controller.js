import {
  esquemaCrearCulto,
  esquemaListarCultos,
  esquemaId,
} from "../validators/cultos.validator.js";
import {
  insertarCulto,
  listarCultos,
  eliminarCulto,
} from "../repositories/cultos.repository.js";

// GET /api/cultos
export async function obtenerCultos(req, res) {
  // Los filtros llegan en req.query (lo que va despues del "?" en la direccion)
  const validacion = esquemaListarCultos.safeParse(req.query);

  if (!validacion.success) {
    return res.status(400).json({
      mensaje: "Filtros inválidos",
      errores: validacion.error.issues.map((problema) => ({
        campo: problema.path.join("."),
        mensaje: problema.message,
      })),
    });
  }

  const cultos = await listarCultos(validacion.data);
  res.json(cultos);
}

// POST /api/cultos
export async function crearCulto(req, res) {
  // 1) Validar. safeParse NO lanza error: devuelve success true o false.
  const validacion = esquemaCrearCulto.safeParse(req.body);

  if (!validacion.success) {
    return res.status(400).json({
      mensaje: "Datos inválidos",
      errores: validacion.error.issues.map((problema) => ({
        campo: problema.path.join("."),
        mensaje: problema.message,
      })),
    });
  }

  // 2) Guardar. Algunos errores de PostgreSQL son "esperados" y los
  //    traducimos a respuestas claras; los demas pasan al manejador general.
  try {
    const culto = await insertarCulto(validacion.data, req.usuario.id);
    return res.status(201).json(culto); // 201 = creado
  } catch (error) {
    // 23505 = violacion de unicidad: ya existe ese tipo de culto en esa fecha
    if (error.code === "23505") {
      return res.status(409).json({
        mensaje: "Ya existe un registro de ese tipo de culto en esa fecha.",
      });
    }

    // 23503 = clave foranea: aqui, el tipo de culto no existe
    if (error.code === "23503" && error.constraint === "cultos_tipo_culto_id_fkey") {
      return res.status(400).json({
        mensaje: "Datos inválidos",
        errores: [{ campo: "tipoCultoId", mensaje: "El tipo de culto no existe." }],
      });
    }

    throw error; // cualquier otro error: lo atiende el manejador central
  }
}

// DELETE /api/cultos/:id
export async function borrarCulto(req, res) {
  // req.params.id es lo que va en la direccion: /api/cultos/12 -> "12"
  const validacion = esquemaId.safeParse(req.params.id);

  if (!validacion.success) {
    return res.status(400).json({ mensaje: "El identificador no es válido." });
  }

  const eliminado = await eliminarCulto(validacion.data, req.usuario.id);

  if (!eliminado) {
    return res.status(404).json({ mensaje: "El registro no existe o ya fue eliminado." });
  }

  // 204 = "hecho, y no hay nada que devolver"
  res.status(204).end();
}