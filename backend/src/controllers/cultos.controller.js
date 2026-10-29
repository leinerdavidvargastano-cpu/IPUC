import {
  esquemaCrearCulto,
  esquemaListarCultos,
  esquemaId,
} from "../validators/cultos.validator.js";
import {
  listarCultos,
  obtenerCultoPorId,
  insertarCulto,
  actualizarCulto,
  eliminarCulto,
} from "../repositories/cultos.repository.js";

// ------------------------------------------------------------
// Ayudantes
// ------------------------------------------------------------

// Convierte los problemas de zod en una lista sencilla para el frontend
function listaDeErrores(validacion) {
  return validacion.error.issues.map((problema) => ({
    campo: problema.path.join("."),
    mensaje: problema.message,
  }));
}

// Lee y valida el :id de la direccion. Si no es valido, responde 400
// y devuelve null (el controlador debe detenerse).
function leerId(req, res) {
  const validacion = esquemaId.safeParse(req.params.id);

  if (!validacion.success) {
    res.status(400).json({ mensaje: "El identificador no es válido." });
    return null;
  }

  return validacion.data;
}

// Traduce errores "esperados" de PostgreSQL a respuestas claras.
// Devuelve true si ya respondio, o false si el error es otro.
function responderErrorEsperado(error, res) {
  // 23505 = violacion de unicidad: ya existe ese tipo de culto en esa fecha
  if (error.code === "23505") {
    res.status(409).json({
      mensaje: "Ya existe un registro de ese tipo de culto en esa fecha.",
    });
    return true;
  }

  // 23503 = clave foranea: aqui, el tipo de culto no existe
  if (error.code === "23503" && error.constraint === "cultos_tipo_culto_id_fkey") {
    res.status(400).json({
      mensaje: "Datos inválidos",
      errores: [{ campo: "tipoCultoId", mensaje: "El tipo de culto no existe." }],
    });
    return true;
  }

  return false;
}

// ------------------------------------------------------------
// Controladores
// ------------------------------------------------------------

// GET /api/cultos
export async function obtenerCultos(req, res) {
  // Los filtros llegan en req.query (lo que va despues del "?" en la direccion)
  const validacion = esquemaListarCultos.safeParse(req.query);

  if (!validacion.success) {
    return res
      .status(400)
      .json({ mensaje: "Filtros inválidos", errores: listaDeErrores(validacion) });
  }

  const cultos = await listarCultos(validacion.data);
  res.json(cultos);
}

// GET /api/cultos/:id
export async function obtenerCulto(req, res) {
  const id = leerId(req, res);
  if (id === null) return;

  const culto = await obtenerCultoPorId(id);

  if (!culto) {
    return res.status(404).json({ mensaje: "El registro no existe o fue eliminado." });
  }

  res.json(culto);
}

// POST /api/cultos
export async function crearCulto(req, res) {
  const validacion = esquemaCrearCulto.safeParse(req.body);

  if (!validacion.success) {
    return res
      .status(400)
      .json({ mensaje: "Datos inválidos", errores: listaDeErrores(validacion) });
  }

  try {
    const id = await insertarCulto(validacion.data, req.usuario.id);
    const culto = await obtenerCultoPorId(id);
    return res.status(201).json(culto); // 201 = creado
  } catch (error) {
    if (responderErrorEsperado(error, res)) return;
    throw error; // cualquier otro error: lo atiende el manejador central
  }
}

// PUT /api/cultos/:id
export async function editarCulto(req, res) {
  const id = leerId(req, res);
  if (id === null) return;

  // PUT reemplaza todo el registro, asi que se valida igual que al crear
  const validacion = esquemaCrearCulto.safeParse(req.body);

  if (!validacion.success) {
    return res
      .status(400)
      .json({ mensaje: "Datos inválidos", errores: listaDeErrores(validacion) });
  }

  try {
    const modificado = await actualizarCulto(id, validacion.data, req.usuario.id);

    if (!modificado) {
      return res.status(404).json({ mensaje: "El registro no existe o fue eliminado." });
    }

    const culto = await obtenerCultoPorId(id);
    return res.json(culto);
  } catch (error) {
    if (responderErrorEsperado(error, res)) return;
    throw error;
  }
}

// DELETE /api/cultos/:id
export async function borrarCulto(req, res) {
  const id = leerId(req, res);
  if (id === null) return;

  const eliminado = await eliminarCulto(id, req.usuario.id);

  if (!eliminado) {
    return res.status(404).json({ mensaje: "El registro no existe o ya fue eliminado." });
  }

  // 204 = "hecho, y no hay nada que devolver"
  res.status(204).end();
}