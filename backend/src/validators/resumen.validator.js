import { z } from "zod";
import { diasEntre } from "../utils/estadisticas.js";

// Un filtro vacio (?desde=) se trata como "no enviado"
const opcional = (esquema) =>
  z.preprocess((valor) => (valor === "" ? undefined : valor), esquema.optional());

// Una fecha "AAAA-MM-DD" que ademas sea un dia real del calendario
const fechaReal = z
  .string({ error: "La fecha no es válida." })
  .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener el formato AAAA-MM-DD.")
  .refine((valor) => {
    const fecha = new Date(`${valor}T00:00:00Z`);
    return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor;
  }, "La fecha no existe en el calendario.");

const MAXIMO_DIAS_RANGO = 1830; // unos 5 anios

export const esquemaResumen = z
  .object({
    periodo: opcional(
      z.enum(["semana", "mes", "anio", "rango"], { error: "El período no es válido." })
    ),
    fecha: opcional(fechaReal),
    desde: opcional(fechaReal),
    hasta: opcional(fechaReal),
  })
  // Reglas que dependen de varios campos a la vez
  .superRefine((datos, contexto) => {
    if (datos.periodo !== "rango") return;

    if (!datos.desde) {
      contexto.addIssue({
        code: "custom",
        path: ["desde"],
        message: "Indica la fecha de inicio del rango.",
      });
    }

    if (!datos.hasta) {
      contexto.addIssue({
        code: "custom",
        path: ["hasta"],
        message: "Indica la fecha final del rango.",
      });
    }

    if (datos.desde && datos.hasta) {
      if (datos.desde > datos.hasta) {
        contexto.addIssue({
          code: "custom",
          path: ["hasta"],
          message: "La fecha final no puede ser anterior a la inicial.",
        });
      } else if (diasEntre(datos.desde, datos.hasta) > MAXIMO_DIAS_RANGO) {
        contexto.addIssue({
          code: "custom",
          path: ["hasta"],
          message: "El rango no puede superar 5 años.",
        });
      }
    }
  });