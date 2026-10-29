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



// Los filtros llegan en la direccion (?mes=10) y siempre son texto.
// Esta funcion hace que un filtro vacio (?mes=) se trate como "no enviado".
const filtro = (esquema) =>
  z.preprocess((valor) => (valor === "" ? undefined : valor), esquema.optional());

export const esquemaListarCultos = z.object({
  fecha: filtro(
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener el formato AAAA-MM-DD.")
  ),
  // z.coerce.number convierte el texto "10" en el numero 10
  tipoCultoId: filtro(
    z.coerce.number({ error: "El tipo de culto no es válido." }).int().positive()
  ),
  mes: filtro(
    z.coerce
      .number({ error: "El mes no es válido." })
      .int()
      .min(1, "El mes debe estar entre 1 y 12.")
      .max(12, "El mes debe estar entre 1 y 12.")
  ),
  anio: filtro(
    z.coerce
      .number({ error: "El año no es válido." })
      .int()
      .min(2000, "El año no es válido.")
      .max(2100, "El año no es válido.")
  ),
  // Si no se envia "orden", se usa fecha-desc (las mas recientes primero)
  orden: z.preprocess(
    (valor) => (valor === "" ? undefined : valor),
    z
      .enum(["fecha-desc", "fecha-asc", "total-desc", "total-asc"], {
        error: "El orden no es válido.",
      })
      .default("fecha-desc")
  ),
});



// Valida el identificador que llega en la direccion (/api/cultos/12).
// El maximo es el numero mas grande que cabe en una columna INTEGER.
export const esquemaId = z.coerce
  .number({ error: "El identificador no es válido." })
  .int("El identificador no es válido.")
  .positive("El identificador no es válido.")
  .max(2147483647, "El identificador no es válido.");