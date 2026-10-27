"use client"; // Recharts mide el tamaño en el navegador, así que debe ser componente de cliente

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Users, Gauge, TrendingUp, TrendingDown } from "lucide-react";
import TarjetaEstadistica from "./TarjetaEstadistica";
import { asistenciaSemanalDemo } from "@/lib/datosDemo";
import styles from "./EstadisticasSemanales.module.css";

// Recharts necesita los colores como valores directos (los mismos de globals.css)
const AZUL = "#2563eb";
const AZUL_SECUNDARIO = "#3b82f6";
const COLOR_BORDE = "#e2e8f0";
const COLOR_TEXTO = "#64748b";

// Globo de información que aparece al pasar el mouse por un punto o una barra.
// Recharts le pasa "payload": los datos del elemento que estás señalando.
function GloboInformacion({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null;
  const dato = payload[0].payload;

  return (
    <div className={styles.globo}>
      <p className={styles.globoTitulo}>{dato.nombre}</p>
      <p className={styles.globoValor}>{dato.total} asistentes</p>
    </div>
  );
}

export default function EstadisticasSemanales() {
  const datos = asistenciaSemanalDemo;

  // .reduce recorre la lista acumulando un resultado.
  // Aquí empieza en 0 y le va sumando el total de cada culto.
  const total = datos.reduce((suma, culto) => suma + culto.total, 0);

  // Promedio por culto = total acumulado / cantidad de cultos
  const promedio = Math.round(total / datos.length);

  // Para el mayor y el menor, nos quedamos con el culto que "gana" en cada comparación
  const mayor = datos.reduce((a, b) => (b.total > a.total ? b : a));
  const menor = datos.reduce((a, b) => (b.total < a.total ? b : a));

  // Propiedades compartidas por los ejes de las dos gráficas
  const estiloEje = { fill: COLOR_TEXTO, fontSize: 12 };

  return (
    <section className={styles.seccion} aria-label="Estadísticas semanales">
      <h2 className={styles.titulo}>Estadísticas semanales</h2>
      <p className={styles.subtitulo}>Semana de ejemplo con datos de demostración.</p>

      <div className={styles.resumen}>
        <TarjetaEstadistica
          titulo="Total acumulado"
          valor={total}
          detalle="Suma de todos los cultos de la semana"
          Icono={Users}
        />
        <TarjetaEstadistica
          titulo="Promedio por culto"
          valor={promedio}
          detalle={`Total dividido entre ${datos.length} cultos`}
          Icono={Gauge}
        />
        <TarjetaEstadistica
          titulo="Mayor asistencia"
          valor={mayor.total}
          detalle={mayor.nombre}
          Icono={TrendingUp}
        />
        <TarjetaEstadistica
          titulo="Menor asistencia"
          valor={menor.total}
          detalle={menor.nombre}
          Icono={TrendingDown}
        />
      </div>

      <div className={styles.graficas}>
        {/* ---------- Gráfica de líneas ---------- */}
        <article className={styles.panel}>
          <h3 className={styles.panelTitulo}>Evolución durante la semana</h3>
          <div className={styles.area}>
            {/* ResponsiveContainer hace que la gráfica ocupe todo el ancho disponible */}
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={datos} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLOR_BORDE} />
                <XAxis dataKey="etiqueta" tick={estiloEje} />
                <YAxis tick={estiloEje} allowDecimals={false} />
                <Tooltip content={<GloboInformacion />} />
                <Line
                  type="monotone"
                  dataKey="total" /* qué campo de los datos se dibuja */
                  stroke={AZUL}
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        {/* ---------- Gráfica de barras ---------- */}
        <article className={styles.panel}>
          <h3 className={styles.panelTitulo}>Comparación entre reuniones</h3>
          <div className={styles.area}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datos} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLOR_BORDE} />
                <XAxis dataKey="etiqueta" tick={estiloEje} />
                <YAxis tick={estiloEje} allowDecimals={false} />
                <Tooltip content={<GloboInformacion />} cursor={{ fill: "#dbeafe" }} />
                <Bar dataKey="total" fill={AZUL_SECUNDARIO} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>
    </section>
  );
}