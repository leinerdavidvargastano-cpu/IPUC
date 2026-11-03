import { z } from "zod";

// Un filtro vacio (?mes=) se trata como "no enviado"
const opcional = (esquema) =>
  z.preprocess((valor) => (valor === "" ? undefined : valor), esquema.optional());

const anioValido = z.coerce
  .number({ error: "El año no es válido." })
  .int("El año no es válido.")
  .min(2000, "El año no es válido.")
  .max(2100, "El año no es válido.");

// Semanal: cualquier dia de la semana que se quiere consultar (opcional)
export const esquemaSemanal = z.object({
  fecha: opcional(
    z
      .string({ error: "La fecha no es válida." })
      .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener el formato AAAA-MM-DD.")
      // Comprueba que sea un dia real del calendario (no 2026-02-31)
      .refine((valor) => {
        const fecha = new Date(`${valor}T00:00:00Z`);
        return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor;
      }, "La fecha no existe en el calendario.")
  ),
});

// Mensual: anio y mes (ambos opcionales; sin ellos, el mes actual)
export const esquemaMensual = z.object({
  anio: opcional(anioValido),
  mes: opcional(
    z.coerce
      .number({ error: "El mes no es válido." })
      .int("El mes no es válido.")
      .min(1, "El mes debe estar entre 1 y 12.")
      .max(12, "El mes debe estar entre 1 y 12.")
  ),
});

// Anual: solo el anio (opcional; sin el, el anio actual)
export const esquemaAnual = z.object({
  anio: opcional(anioValido),
});