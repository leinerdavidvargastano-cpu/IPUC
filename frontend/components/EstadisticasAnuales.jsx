"use client"; // Recharts mide el tamaño en el navegador, y hay estado y efectos

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  Cell,
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
  CalendarDays,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
} from "lucide-react";
import TarjetaEstadistica from "./TarjetaEstadistica";
import GloboInformacion from "./GloboInformacion";
import { fetchApi } from "@/lib/api";
import { formatearFechaCorta } from "@/lib/formato";
import styles from "./EstadisticasSemanales.module.css"; // mismos estilos de seccion y graficas
import tablaUi from "./TablaRegistros.module.css"; // estilos de tabla y de cuadros de estado

// Recharts necesita los colores como valores directos (los mismos de globals.css)
const AZUL = "#2563eb";
const AZUL_CLARO = "#93c5fd"; // para el mes en curso
const COLOR_BORDE = "#e2e8f0";
const COLOR_TEXTO = "#64748b";

// Los ultimos 6 anios, empezando por el actual
const ANIO_ACTUAL = new Date().getFullYear();
const ANIOS = Array.from({ length: 6 }, (_, indice) => ANIO_ACTUAL - indice);

const formatear = (valor) => valor.toLocaleString("es-CO");

// Tarjeta de comparacion con el anio anterior.
//  - comparacion: { totalActual, totalAnterior, cultosAnterior, diferencia, porcentaje }
//  Un total null significa "sin registros": no se inventa ningun porcentaje.
function tarjetaComparacion(titulo, comparacion, anio, anioAnterior) {
  const hayPorcentaje = comparacion.porcentaje !== null;

  let detalle;
  if (comparacion.totalAnterior === null) {
    detalle = `${anioAnterior} no tiene registros en ese período`;
  } else if (comparacion.totalActual === null) {
    detalle = `${anio} no tiene registros (antes: ${formatear(comparacion.totalAnterior)})`;
  } else {
    detalle = `${anioAnterior}: ${formatear(comparacion.totalAnterior)} asistentes en ${
      comparacion.cultosAnterior
    } ${comparacion.cultosAnterior === 1 ? "culto" : "cultos"}`;
  }

  return {
    titulo,
    valor: hayPorcentaje
      ? `${comparacion.porcentaje > 0 ? "+" : ""}${formatear(comparacion.porcentaje)} %`
      : "Sin datos",
    detalle,
    Icono: ArrowLeftRight,
    // verde si sube, rojo si baja; sin color si no hay porcentaje o no cambia
    tendencia:
      comparacion.porcentaje > 0 ? "positiva" : comparacion.porcentaje < 0 ? "negativa" : undefined,
  };
}

// ------------------------------------------------------------
// Tarjetas, grafica y tabla de UN anio (ya con los datos del servidor)
// ------------------------------------------------------------
function ContenidoAnio({ datos }) {
  const { anio, meses, resumen, comparacion } = datos;

  // Sin ningun culto: mensaje claro en lugar de graficas vacias
  if (resumen.cultosRegistrados === 0) {
    return (
      <div className={tablaUi.vacio}>
        <p className={tablaUi.vacioTitulo}>No hay cultos registrados en este año</p>
        <p>Cuando se registren, aparecerán aquí sus estadísticas.</p>
      </div>
    );
  }

  // Una barra por mes. total: null = sin registros (hueco), no cero.
  const datosGrafica = meses.map((mes) => ({
    etiqueta: mes.nombre.slice(0, 3), // "Enero" -> "Ene"
    nombre: mes.nombre,
    detalle:
      mes.cultosRegistrados > 0
        ? `${mes.cultosRegistrados} ${mes.cultosRegistrados === 1 ? "culto" : "cultos"}${
            mes.terminado ? "" : " · mes en curso"
          }`
        : "",
    total: mes.total,
    enCurso: mes.total !== null && !mes.terminado,
  }));

  const { moda, mesMayor, mesMenor } = resumen;
  const hayTerminados = resumen.mesesTerminadosConRegistros > 0;
  const nombresMeses = (lista) => lista.map((mes) => mes.nombre).join(" y ");

  // Si el anio ya termino, "mismo periodo" y "anio completo" son lo mismo: una sola tarjeta
  const mismoPeriodo = comparacion.mismoPeriodo;
  const anioCompleto = mismoPeriodo.hasta.endsWith("-12-31");

  const estiloEje = { fill: COLOR_TEXTO, fontSize: 12 };

  return (
    <>
      <div className={styles.resumen}>
        <TarjetaEstadistica
          titulo="Total acumulado anual"
          valor={formatear(resumen.totalAcumulado)}
          detalle={`En ${resumen.cultosRegistrados} ${
            resumen.cultosRegistrados === 1 ? "culto" : "cultos"
          }`}
          Icono={Users}
        />
        <TarjetaEstadistica
          titulo="Promedio por culto"
          valor={formatear(resumen.promedioPorCulto)}
          detalle="Total del año ÷ cultos registrados"
          Icono={Gauge}
        />
        <TarjetaEstadistica
          titulo="Moda por culto"
          valor={moda.hayModa ? moda.valores.map((valor) => formatear(valor)).join(" y ") : "Sin moda"}
          detalle={
            moda.hayModa
              ? `Se repite en ${moda.frecuencia} cultos`
              : "Ninguna asistencia se repite"
          }
          Icono={Repeat}
        />
        <TarjetaEstadistica
          titulo="Promedio mensual (total acumulado)"
          valor={hayTerminados ? formatear(resumen.promedioDelTotalMensual) : "Sin datos"}
          detalle={
            hayTerminados
              ? `Total acumulado por mes, en ${resumen.mesesTerminadosConRegistros} ${
                  resumen.mesesTerminadosConRegistros === 1
                    ? "mes terminado"
                    : "meses terminados"
                }`
              : "Se necesita al menos un mes terminado con registros"
          }
          Icono={CalendarDays}
        />
        <TarjetaEstadistica
          titulo="Mes con mayor asistencia"
          valor={hayTerminados ? formatear(mesMayor[0].total) : "Sin datos"}
          detalle={hayTerminados ? nombresMeses(mesMayor) : "Solo cuentan meses terminados"}
          Icono={TrendingUp}
        />
        <TarjetaEstadistica
          titulo="Mes con menor asistencia"
          valor={hayTerminados ? formatear(mesMenor[0].total) : "Sin datos"}
          detalle={hayTerminados ? nombresMeses(mesMenor) : "Solo cuentan meses terminados"}
          Icono={TrendingDown}
        />
        <TarjetaEstadistica
          {...tarjetaComparacion(
            anioCompleto
              ? `Comparación con ${comparacion.anioAnterior}`
              : `Comparación con ${comparacion.anioAnterior} (mismo período)`,
            mismoPeriodo,
            anio,
            comparacion.anioAnterior
          )}
        />
        {!anioCompleto && (
          <TarjetaEstadistica
            {...tarjetaComparacion(
              `Comparación con ${comparacion.anioAnterior} (año completo)`,
              comparacion.anioCompleto,
              anio,
              comparacion.anioAnterior
            )}
          />
        )}
      </div>

      {/* Que periodo exacto se compara, para que no haya dudas */}
      {!anioCompleto && (
        <p className={styles.nota} style={{ marginTop: 0, marginBottom: 16 }}>
          Mismo período: del {formatearFechaCorta(mismoPeriodo.desde)} al{" "}
          {formatearFechaCorta(mismoPeriodo.hasta)} frente al{" "}
          {formatearFechaCorta(mismoPeriodo.desdeAnterior)} al{" "}
          {formatearFechaCorta(mismoPeriodo.hastaAnterior)}. Comparar contra el año completo
          anterior suele dar una caída falsa mientras el año no termina.
        </p>
      )}

      <article className={styles.panel}>
        <h3 className={styles.panelTitulo}>Asistencia total por mes</h3>
        <div className={styles.area}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={datosGrafica} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLOR_BORDE} />
              <XAxis dataKey="etiqueta" tick={estiloEje} interval={0} />
              <YAxis tick={estiloEje} allowDecimals={false} domain={[0, "auto"]} />
              <Tooltip
                content={<GloboInformacion />}
                cursor={{ fill: "#dbeafe" }}
                filterNull={false}
              />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {/* Cada barra con su color: clara si el mes todavia esta en curso */}
                {datosGrafica.map((punto) => (
                  <Cell key={punto.nombre} fill={punto.enCurso ? AZUL_CLARO : AZUL} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className={styles.nota}>
          Barra clara = mes en curso (todavía no termina): cuenta para el total del año, pero no
          para el promedio mensual ni la comparación entre meses. Un mes sin barra no tuvo
          registros: no se cuenta como cero asistentes.
        </p>
      </article>

      {/* ---------- Detalle por mes ---------- */}
      <div className={tablaUi.contenedorTabla} style={{ marginTop: 16 }}>
        <table className={tablaUi.tabla} style={{ minWidth: 480 }}>
          <thead>
            <tr>
              <th scope="col">Mes</th>
              <th scope="col" className={tablaUi.numero}>Cultos</th>
              <th scope="col" className={tablaUi.numero}>Total</th>
            </tr>
          </thead>
          <tbody>
            {meses.map((mes) => (
              <tr key={mes.mes}>
                <td>
                  {mes.nombre}
                  {mes.total !== null && !mes.terminado && " (en curso)"}
                </td>
                <td className={tablaUi.numero}>{mes.cultosRegistrados}</td>
                <td className={`${tablaUi.numero} ${tablaUi.total}`}>
                  {mes.total === null ? "Sin registros" : formatear(mes.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ------------------------------------------------------------
// Seccion completa: selector de anio + contenido
// ------------------------------------------------------------
export default function EstadisticasAnuales() {
  // "" = el anio actual. Asi no dependemos de la fecha del computador al dibujar.
  const [anio, setAnio] = useState("");

  // Guardamos el resultado JUNTO con la consulta que lo produjo ("clave").
  const [resultado, setResultado] = useState({ clave: null, datos: null, error: "" });

  const consulta = anio ? `?anio=${anio}` : "";
  const clave = anio || "actual";
  const cargando = resultado.clave !== clave;

  useEffect(() => {
    // "activo" descarta respuestas viejas si cambias de anio rapido
    let activo = true;

    fetchApi(`/api/estadisticas/anual${consulta}`)
      .then(async (respuesta) => {
        const datos = await respuesta.json().catch(() => null);

        if (!respuesta.ok) {
          throw new Error(
            datos?.errores?.[0]?.mensaje ?? datos?.mensaje ?? "No se pudo cargar el año."
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
  const hayDatos = !cargando && !resultado.error && datos !== null;

  let cuerpo;

  if (cargando) {
    cuerpo = (
      <div className={tablaUi.vacio} role="status">
        <p>Cargando año...</p>
      </div>
    );
  } else if (resultado.error) {
    cuerpo = (
      <div className={`${tablaUi.vacio} ${tablaUi.errorCarga}`} role="alert">
        <p className={tablaUi.vacioTitulo}>No se pudo cargar el año</p>
        <p>{resultado.error}</p>
      </div>
    );
  } else {
    cuerpo = <ContenidoAnio datos={datos} />;
  }

  return (
    <section className={styles.seccion} aria-label="Estadísticas anuales">
      <h2 className={styles.titulo}>Estadísticas anuales</h2>
      <p className={styles.subtitulo}>
        {hayDatos ? (
          <>
            Año <strong>{datos.anio}</strong> · de enero a diciembre.
          </>
        ) : (
          "De enero a diciembre."
        )}
      </p>

      <div className={styles.filtros}>
        <label className={styles.etiquetaFiltro}>
          Año
          <select
            className={styles.selector}
            value={anio}
            onChange={(evento) => setAnio(evento.target.value)}
          >
            <option value="">Año actual</option>
            {ANIOS.map((valor) => (
              <option key={valor} value={valor}>
                {valor}
              </option>
            ))}
          </select>
        </label>
      </div>

      {cuerpo}
    </section>
  );
}