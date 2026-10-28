import { listarTiposCultoActivos } from "../repositories/tiposCulto.repository.js";

// GET /api/tipos-culto
export async function obtenerTiposCulto(req, res) {
  const tipos = await listarTiposCultoActivos();
  res.json(tipos);
}