import test from "node:test";
import assert from "node:assert/strict";
import {
  sumar,
  promedio,
  moda,
  extremos,
  sumarDias,
  inicioDeSemana,
  finDeSemana,
} from "../src/utils/estadisticas.js";

test("sumar: suma los valores y da 0 si no hay ninguno", () => {
  assert.equal(sumar([50, 70, 90]), 210);
  assert.equal(sumar([]), 0);
});

test("promedio: null sin datos y redondeo a un decimal", () => {
  assert.equal(promedio([]), null);
  assert.equal(promedio([100, 50, 75]), 75);
  assert.equal(promedio([1, 2]), 1.5);
  assert.equal(promedio([10, 11, 11]), 10.7);
});

test("moda: un solo valor que se repite", () => {
  assert.deepEqual(moda([5, 5, 3]), { hayModa: true, valores: [5], frecuencia: 2 });
});

test("moda: si varios valores empatan, se muestran todos", () => {
  assert.deepEqual(moda([5, 5, 3, 3, 1]), { hayModa: true, valores: [3, 5], frecuencia: 2 });
});

test("moda: si ningun valor se repite, no hay moda", () => {
  assert.equal(moda([1, 2, 3]).hayModa, false);
  assert.equal(moda([]).hayModa, false);
});

test("moda: el cero repetido SI es una moda (asistencia cero registrada)", () => {
  assert.deepEqual(moda([0, 0, 4]), { hayModa: true, valores: [0], frecuencia: 2 });
});

test("extremos: incluye a todos los empatados", () => {
  const cultos = [
    { id: 1, total: 10 },
    { id: 2, total: 30 },
    { id: 3, total: 30 },
    { id: 4, total: 5 },
  ];
  const { mayor, menor } = extremos(cultos);
  assert.deepEqual(mayor.map((c) => c.id), [2, 3]);
  assert.deepEqual(menor.map((c) => c.id), [4]);
  assert.deepEqual(extremos([]), { mayor: [], menor: [] });
});

test("semanas de lunes a domingo", () => {
  // 25 de octubre de 2026 es domingo: pertenece a la semana que empezo el 19
  assert.equal(inicioDeSemana("2026-10-25"), "2026-10-19");
  // Un lunes es el inicio de su propia semana
  assert.equal(inicioDeSemana("2026-10-26"), "2026-10-26");
  // Mitad de semana
  assert.equal(inicioDeSemana("2026-10-21"), "2026-10-19");
  assert.equal(finDeSemana("2026-10-21"), "2026-10-25");
  // La semana puede cruzar de un mes al siguiente
  assert.equal(inicioDeSemana("2026-11-01"), "2026-10-26");
  assert.equal(finDeSemana("2026-10-28"), "2026-11-01");
});

test("sumarDias cruza meses y anios", () => {
  assert.equal(sumarDias("2026-12-31", 1), "2027-01-01");
  assert.equal(sumarDias("2026-03-01", -1), "2026-02-28");
});