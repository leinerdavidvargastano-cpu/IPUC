import { z } from "zod";

export const esquemaLogin = z.object({
  email: z
    .string({ error: "El correo es obligatorio." })
    .trim()
    .toLowerCase()
    .min(1, "El correo es obligatorio.")
    .max(254, "El correo es demasiado largo."),
  // Se limita el largo para que nadie envie textos gigantes
  contrasena: z
    .string({ error: "La contraseña es obligatoria." })
    .min(1, "La contraseña es obligatoria.")
    .max(200, "La contraseña es demasiado larga."),
});