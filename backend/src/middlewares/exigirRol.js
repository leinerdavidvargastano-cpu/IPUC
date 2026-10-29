// Deja pasar solo a los usuarios cuyo rol esta en la lista.
//
// Esto es una "fabrica de middlewares": una funcion que devuelve otra.
// Se usa asi:  exigirRol("admin")  o  exigirRol("admin", "secretario")
//
// SIEMPRE va DESPUES de "autenticar", que es quien llena req.usuario.
export function exigirRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      // 401 = no sabemos quien eres; 403 = sabemos quien eres, pero no puedes hacer esto
      return res.status(403).json({ mensaje: "No tienes permiso para hacer esto." });
    }
    next();
  };
}