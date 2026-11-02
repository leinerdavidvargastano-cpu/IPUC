import { z } from "zod";

// "fecha" es opcional: si no se envia, se usa la semana actual.
// Se acepta cualquier dia de la semana que se quiere consultar.
export const esquemaSemanal = z.object({
  fecha: z.preprocess(
    (valor) => (valor === "" ? undefined : valor),
    z
      .string({ error: "La fecha no es válida." })
      .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener el formato AAAA-MM-DD.")
      // Comprueba que sea un dia real del calendario (no 2026-02-31)
      .refine((valor) => {
        const fecha = new Date(`${valor}T00:00:00Z`);
        return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor;
      }, "La fecha no existe en el calendario.")
      .optional()
  ),
});