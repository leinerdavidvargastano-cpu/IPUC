// Se usa cuando alguien pide una direccion de /api que no existe
export function rutaNoEncontrada(req, res) {
  res.status(404).json({ mensaje: "Ruta no encontrada" });
}

// Manejador central de errores.
// Express lo reconoce como tal porque tiene EXACTAMENTE 4 parametros
// (error, req, res, next), aunque "next" no se use.
export function manejadorErrores(error, req, res, next) {
  // Si ya se empezo a responder, no se puede cambiar la respuesta
  if (res.headersSent) return next(error);

  // ----- Errores que causa quien envia datos malos: son 4xx, no 500 -----

  // JSON mal formado o demasiado grande (lo detecta express.json)
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ mensaje: "El formato de los datos enviados no es válido." });
  }

  if (error.type === "entity.too.large") {
    return res.status(413).json({ mensaje: "Los datos enviados son demasiado grandes." });
  }

  // Errores de PostgreSQL por datos que no caben o no tienen sentido
  if (error.code === "22003") {
    // numeric_value_out_of_range
    return res.status(400).json({ mensaje: "Uno de los números enviados es demasiado grande." });
  }

  if (error.code === "22001") {
    // string_data_right_truncation
    return res.status(400).json({ mensaje: "Uno de los textos enviados es demasiado largo." });
  }

  if (error.code === "22P02") {
    // invalid_text_representation
    return res.status(400).json({ mensaje: "Uno de los datos enviados no tiene un formato válido." });
  }

  // ----- Cualquier otro error SI es nuestro: se registra y se responde generico -----

  // El detalle real se queda en la terminal del servidor
  console.error("Error no controlado:", error);

  // Al navegador solo le llega un mensaje generico,
  // para no revelar informacion interna
  res.status(500).json({ mensaje: "Error interno del servidor" });
}