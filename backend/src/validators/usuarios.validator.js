import { z } from "zod";

export const esquemaCrearUsuario = z.object({
  nombreCompleto: z
    .string({ error: "El nombre es obligatorio." })
    .trim()
    .min(3, "El nombre es demasiado corto.")
    .max(150, "El nombre no puede superar 150 caracteres."),
  email: z
    .string({ error: "El correo es obligatorio." })
    .trim()
    .toLowerCase()
    .max(254, "El correo es demasiado largo.")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "El correo electrónico no es válido."),
  rol: z.enum(["admin", "secretario"], { error: "El rol no es válido." }),
});

export const esquemaEstadoUsuario = z.object({
  activo: z.boolean({ error: "Indica si la cuenta debe estar activa o no." }),
});