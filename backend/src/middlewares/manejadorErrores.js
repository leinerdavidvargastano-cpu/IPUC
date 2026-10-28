// Se usa cuando alguien pide una direccion de /api que no existe
export function rutaNoEncontrada(req, res) {
  res.status(404).json({ mensaje: "Ruta no encontrada" });
}

// Manejador central de errores.
// Express lo reconoce como tal porque tiene EXACTAMENTE 4 parametros
// (error, req, res, next), aunque "next" no se use.
export function manejadorErrores(error, req, res, next) {
  // El detalle real se queda en la terminal del servidor
  console.error("Error no controlado:", error);

  // Al navegador solo le llega un mensaje generico,
  // para no revelar informacion interna
  res.status(500).json({ mensaje: "Error interno del servidor" });
}