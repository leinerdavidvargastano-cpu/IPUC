import { z } from "zod";

// Fecha de hoy en Colombia como "AAAA-MM-DD" (el locale en-CA da ese formato)
function hoyEnColombia() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
}

// Un numero entero de cero en adelante, con mensajes en espanol
const entero = (etiqueta) =>
  z
    .number({ error: `${etiqueta} es obligatorio y debe ser un número.` })
    .int(`${etiqueta} debe ser un número entero.`)
    .min(0, `${etiqueta} no puede ser negativo.`);

// Texto opcional: se recorta, se limita el largo y, si queda vacio, pasa a null
const textoOpcional = (etiqueta, maximo) =>
  z
    .string()
    .trim()
    .max(maximo, `${etiqueta} no puede superar ${maximo} caracteres.`)
    .nullish()
    .transform((valor) => (valor ? valor : null));

export const esquemaCrearCulto = z.object({
  fecha: z
    .string({ error: "La fecha es obligatoria." })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener el formato AAAA-MM-DD.")
    // Comprueba que sea un dia real del calendario (no 2026-02-31)
    .refine((valor) => {
      const fecha = new Date(`${valor}T00:00:00Z`);
      return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor;
    }, "La fecha no existe en el calendario.")
    .refine((valor) => valor <= hoyEnColombia(), "La fecha no puede ser futura."),

  tipoCultoId: z
    .number({ error: "El tipo de culto es obligatorio." })
    .int("El tipo de culto no es válido.")
    .positive("El tipo de culto no es válido."),

  hermanos: entero("El número de hermanos"),
  visitas: entero("El número de visitas"),
  ninos: entero("El número de niños"),
  adolescentes: entero("El número de adolescentes"),

  ofrendaCop: z
    .number({ error: "La ofrenda debe ser un número." })
    .int("La ofrenda debe ser un número entero.")
    .min(0, "La ofrenda no puede ser negativa.")
    .nullish()
    .transform((valor) => valor ?? null),

  dirigio: textoOpcional("El nombre de quien dirigió", 100),
  predico: textoOpcional("El nombre de quien predicó", 100),
  lema: textoOpcional("El lema", 150),
  tema: textoOpcional("El tema", 150),
  observaciones: textoOpcional("Las observaciones", 500),
});