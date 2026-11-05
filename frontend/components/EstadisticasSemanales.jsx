"use client"; // Recharts mide el tamaño en el navegador, y hay estado y efectos

import { useEffect, useState } from "react";
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
import {
  Users,
  Gauge,
  Repeat,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import TarjetaEstadistica from "./TarjetaEstadistica";
import GloboInformacion from "./GloboInformacion";
import { fetchApi } from "@/lib/api";
import { formatearFecha, formatearFechaCorta } from "@/lib/formato";
import styles from "./EstadisticasSemanales.module.css";
import tablaUi from "./TablaRegistros.module.css"; // reutilizamos el boton y los cuadros de estado

// Recharts necesita los colores como valores directos (los mismos de globals.css)
const AZUL = "#2563eb";
const AZUL_SECUNDARIO = "#3b82f6";
const COLOR_BORDE = "#e2e8f0";
const COLOR_TEXTO = "#64748b";

// Nombre corto de cada dia. El indice coincide con "diaSemana" (0 = domingo).
const DIAS = ["Dom.", "Lun.", "Mar.", "Mié.", "Jue.", "Vie.", "Sáb."];

const formatear = (valor) => valor.toLocaleString("es-CO");

// Suma "dias" dias a una fecha "AAAA-MM-DD" (se calcula en UTC para que la
// zona horaria nunca mueva un dia).
function moverFecha(fechaIso, dias) {
  const [anio, mes, dia] = fechaIso.split("-").map(Number);
  return new Date(Date.UTC(anio, mes - 1, dia + dias)).toISOString().slice(0, 10);
}

// Etiqueta corta de una reunion para el eje X. Si hay dos reuniones el mismo
// dia (el domingo), se distingue con el texto entre parentesis del nombre:
// "Culto dominical (mañana)" -> "Dom. (mañana)".
function etiquetaCorta(reunion, todas) {
  const dia = DIAS[reunion.diaSemana] ?? reunion.tipoCulto;
  const delMismoDia = todas.filter((otra) => otra.diaSemana === reunion.diaSemana).length;

  if (delMismoDia <= 1) return dia;

  const detalle = reunion.tipoCulto.match(/\(([^)]+)\)/)?.[1];
  return detalle ? `${dia} (${detalle})` : `${dia} ${reunion.orden}`;
}

// ------------------------------------------------------------
// Tarjetas y graficas de UNA semana (ya con los datos del servidor)
// ------------------------------------------------------------
function ContenidoSemana({ datos }) {
  const { reuniones, resumen } = datos;

  // Sin ningun culto: mensaje claro en lugar de graficas vacias
  if (resumen.cultosRegistrados === 0) {
    return (
      <div className={tablaUi.vacio}>
        <p className={tablaUi.vacioTitulo}>No hay cultos registrados en esta semana</p>
        <p>Cuando se registren, aparecerán aquí sus estadísticas.</p>
      </div>
    );
  }

  // Un punto por reunion. total: null = sin registro (hueco), no cero.
  const datosGrafica = reuniones.map((reunion) => ({
    etiqueta: etiquetaCorta(reunion, reuniones),
    nombre: reunion.tipoCulto,
    detalle: reunion.cultos.map((culto) => formatearFecha(culto.fecha)).join(" y "),
    total:
      reunion.cultos.length > 0
        ? reunion.cultos.reduce((suma, culto) => suma + culto.total, 0)
        : null,
  }));

  const sinRegistro = datosGrafica.filter((punto) => punto.total === null).map((p) => p.etiqueta);

  const { moda, mayor, menor } = resumen;
  const nombres = (lista) => lista.map((culto) => culto.tipoCulto).join(" · ");

  // Propiedades compartidas por los ejes de las dos graficas
  const estiloEje = { fill: COLOR_TEXTO, fontSize: 12 };
  const ejeX = {
    dataKey: "etiqueta",
    tick: estiloEje,
    interval: 0, // mostrar TODAS las etiquetas
    angle: -25,
    textAnchor: "end",
    height: 60,
  };

  return (
    <>
      <div className={styles.resumen}>
        <TarjetaEstadistica
          titulo="Total acumulado"
          valor={formatear(resumen.totalAcumulado)}
          detalle={`En ${resumen.cultosRegistrados} ${
            resumen.cultosRegistrados === 1 ? "culto" : "cultos"
          }`}
          Icono={Users}
        />
        <TarjetaEstadistica
          titulo="Promedio por culto"
          valor={formatear(resumen.promedioPorCulto)}
          detalle="Total ÷ cultos registrados"
          Icono={Gauge}
        />
        <TarjetaEstadistica
          titulo="Moda de asistencia"
          valor={moda.hayModa ? moda.valores.map((valor) => formatear(valor)).join(" y ") : "Sin moda"}
          detalle={
            moda.hayModa
              ? `Se repite en ${moda.frecuencia} cultos`
              : "Ninguna asistencia se repite"
          }
          Icono={Repeat}
        />
        <TarjetaEstadistica
          titulo="Mayor asistencia"
          valor={formatear(mayor[0].total)}
          detalle={nombres(mayor)}
          Icono={TrendingUp}
        />
        <TarjetaEstadistica
          titulo="Menor asistencia"
          valor={formatear(menor[0].total)}
          detalle={nombres(menor)}
          Icono={TrendingDown}
        />
      </div>

      <div className={styles.graficas}>
        {/* ---------- Grafica de lineas ---------- */}
        <article className={styles.panel}>
          <h3 className={styles.panelTitulo}>Evolución durante la semana</h3>
          <div className={styles.area}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={datosGrafica} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLOR_BORDE} />
                <XAxis {...ejeX} />
                <YAxis tick={estiloEje} allowDecimals={false} domain={[0, "auto"]} />
                <Tooltip content={<GloboInformacion />} filterNull={false} />
                {/* connectNulls=false: donde no hay registro, la linea se corta */}
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke={AZUL}
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        {/* ---------- Grafica de barras ---------- */}
        <article className={styles.panel}>
          <h3 className={styles.panelTitulo}>Comparación entre reuniones</h3>
          <div className={styles.area}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosGrafica} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLOR_BORDE} />
                <XAxis {...ejeX} />
                <YAxis tick={estiloEje} allowDecimals={false} domain={[0, "auto"]} />
                <Tooltip content={<GloboInformacion />} cursor={{ fill: "#dbeafe" }} filterNull={false} />
                <Bar dataKey="total" fill={AZUL_SECUNDARIO} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      {/* Aviso explicito: sin registro NO es lo mismo que cero asistentes */}
      {sinRegistro.length > 0 && (
        <p className={styles.nota}>
          Sin registro esta semana: {sinRegistro.join(", ")}. No se cuentan como cero asistentes.
        </p>
      )}
    </>
  );
}

// ------------------------------------------------------------
// Seccion completa: selector de semana + contenido
// ------------------------------------------------------------
export default function EstadisticasSemanales() {
  // fecha: cualquier dia de la semana que se quiere ver. "" = la semana actual.
  const [fecha, setFecha] = useState("");

  // Guardamos el resultado JUNTO con la consulta que lo produjo ("clave").
  const [resultado, setResultado] = useState({ clave: null, datos: null, error: "" });

  const consulta = fecha ? `?fecha=${fecha}` : "";
  const clave = fecha || "actual";
  const cargando = resultado.clave !== clave;

  useEffect(() => {
    // "activo" descarta respuestas viejas si cambias de semana rapido
    let activo = true;

    fetchApi(`/api/estadisticas/semanal${consulta}`)
      .then(async (respuesta) => {
        const datos = await respuesta.json().catch(() => null);

        if (!respuesta.ok) {
          throw new Error(
            datos?.errores?.[0]?.mensaje ?? datos?.mensaje ?? "No se pudo cargar la semana."
          );
        }

        if (activo) setResultado({ clave, datos, error: "" });
      })
      .catch((error) => {
        if (!activo) return;
        const mensaje =
          error instanceof TypeError
            ? "No se pudo conectar con el servidor. Revisa que esté encendido."
            : error.message;
        setResultado({ clave, datos: null, error: mensaje });
      });

    return () => {
      activo = false;
    };
  }, [clave, consulta]);

  const datos = resultado.datos;
  const puedeMover = !cargando && !resultado.error && datos !== null;

  let cuerpo;

  if (cargando) {
    cuerpo = (
      <div className={tablaUi.vacio} role="status">
        <p>Cargando semana...</p>
      </div>
    );
  } else if (resultado.error) {
    cuerpo = (
      <div className={`${tablaUi.vacio} ${tablaUi.errorCarga}`} role="alert">
        <p className={tablaUi.vacioTitulo}>No se pudo cargar la semana</p>
        <p>{resultado.error}</p>
      </div>
    );
  } else {
    cuerpo = <ContenidoSemana datos={datos} />;
  }

  return (
    <section className={styles.seccion} aria-label="Estadísticas semanales">
      <h2 className={styles.titulo}>Estadísticas semanales</h2>
      <p className={styles.subtitulo}>
        {puedeMover ? (
          <>
            Semana del <strong>{formatearFechaCorta(datos.desde)}</strong> al{" "}
            <strong>{formatearFechaCorta(datos.hasta)}</strong> (de lunes a domingo).
          </>
        ) : (
          "Semana de lunes a domingo."
        )}
      </p>

      <div className={styles.filtros}>
        <label className={styles.etiquetaFiltro}>
          Día de referencia (vacío = esta semana)
          <input
            type="date"
            className={styles.selector}
            value={fecha}
            onChange={(evento) => setFecha(evento.target.value)}
          />
        </label>

        <button
          type="button"
          className={tablaUi.limpiar}
          style={{ alignSelf: "flex-end" }}
          disabled={!puedeMover}
          onClick={() => setFecha(moverFecha(datos.desde, -7))}
        >
          <ChevronLeft size={16} aria-hidden="true" style={{ verticalAlign: "middle" }} /> Semana
          anterior
        </button>

        <button
          type="button"
          className={tablaUi.limpiar}
          style={{ alignSelf: "flex-end" }}
          disabled={!puedeMover}
          onClick={() => setFecha(moverFecha(datos.desde, 7))}
        >
          Semana siguiente{" "}
          <ChevronRight size={16} aria-hidden="true" style={{ verticalAlign: "middle" }} />
        </button>

        {fecha !== "" && (
          <button
            type="button"
            className={tablaUi.limpiar}
            style={{ alignSelf: "flex-end" }}
            onClick={() => setFecha("")}
          >
            Esta semana
          </button>
        )}
      </div>

      {cuerpo}
    </section>
  );
}