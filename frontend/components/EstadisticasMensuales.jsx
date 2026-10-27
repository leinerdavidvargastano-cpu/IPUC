"use client"; // usa useState y Recharts, que necesitan el navegador

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Users, Gauge, CalendarDays, TrendingUp, TrendingDown } from "lucide-react";
import TarjetaEstadistica from "./TarjetaEstadistica";
import GloboInformacion from "./GloboInformacion";
import { asistenciaMensualDemo } from "@/lib/datosDemo";
import styles from "./EstadisticasSemanales.module.css"; // reutilizamos los mismos estilos

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const ANIOS = [2024, 2025, 2026];

export default function EstadisticasMensuales() {
  // Estado de los dos selectores. El mes se guarda como número: 0 = enero, 9 = octubre.
  const [mes, setMes] = useState(9);
  const [anio, setAnio] = useState(2026);

  const datos = asistenciaMensualDemo;

  // Total acumulado del mes: suma de las semanas
  const total = datos.reduce((suma, semana) => suma + semana.total, 0);
  // Cantidad de cultos del mes: suma de los cultos de cada semana
  const cultos = datos.reduce((suma, semana) => suma + semana.cultos, 0);

  // OJO: son dos promedios distintos, no hay que confundirlos
  const promedioPorCulto = Math.round(total / cultos); // asistentes en un culto típico
  const promedioSemanal = Math.round(total / datos.length); // total acumulado de una semana típica

  const mayor = datos.reduce((a, b) => (b.total > a.total ? b : a));
  const menor = datos.reduce((a, b) => (b.total < a.total ? b : a));

  const estiloEje = { fill: "#64748b", fontSize: 12 };

  return (
    <section className={styles.seccion} aria-label="Estadísticas mensuales">
      <h2 className={styles.titulo}>Estadísticas mensuales</h2>
      <p className={styles.subtitulo}>
        {MESES[mes]} de {anio} · datos de demostración.
      </p>

      <div className={styles.filtros}>
        {/* Selector controlado: su valor vive en el estado de React.
            Al cambiar, onChange actualiza el estado y React vuelve a dibujar. */}
        <label className={styles.etiquetaFiltro}>
          Mes
          <select
            className={styles.selector}
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
          >
            {MESES.map((nombre, indice) => (
              <option key={nombre} value={indice}>
                {nombre}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.etiquetaFiltro}>
          Año
          <select
            className={styles.selector}
            value={anio}
            onChange={(e) => setAnio(Number(e.target.value))}
          >
            {ANIOS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={styles.resumen}>
        <TarjetaEstadistica
          titulo="Total acumulado del mes"
          valor={total.toLocaleString("es-CO")}
          detalle={`En ${cultos} cultos registrados`}
          Icono={Users}
        />
        <TarjetaEstadistica
          titulo="Promedio por culto"
          valor={promedioPorCulto}
          detalle="Total del mes ÷ número de cultos"
          Icono={Gauge}
        />
        <TarjetaEstadistica
          titulo="Promedio semanal"
          valor={promedioSemanal.toLocaleString("es-CO")}
          detalle="Total acumulado por semana, en promedio"
          Icono={CalendarDays}
        />
        <TarjetaEstadistica
          titulo="Semana con mayor asistencia"
          valor={mayor.nombre}
          detalle={`${mayor.total} asistentes en total`}
          Icono={TrendingUp}
        />
        <TarjetaEstadistica
          titulo="Semana con menor asistencia"
          valor={menor.nombre}
          detalle={`${menor.total} asistentes en total`}
          Icono={TrendingDown}
        />
      </div>

      <article className={styles.panel}>
        <h3 className={styles.panelTitulo}>Asistencia total por semana</h3>
        <div className={styles.area}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={datos} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="nombre" tick={estiloEje} />
              <YAxis tick={estiloEje} allowDecimals={false} />
              <Tooltip content={<GloboInformacion />} cursor={{ fill: "#dbeafe" }} />
              <Bar dataKey="total" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>
    </section>
  );
}