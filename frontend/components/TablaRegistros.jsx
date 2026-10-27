"use client"; // usa estado y eventos del navegador

import { useState } from "react";
import { Eye, Pencil, Trash2, Info, CircleCheck } from "lucide-react";
import Modal from "./Modal";
import { registrosDemo, tiposCultoDemo } from "@/lib/datosDemo";
import { formatearFecha, formatearPesos } from "@/lib/formato";
import styles from "./TablaRegistros.module.css";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const ORDENES = [
  { valor: "fecha-desc", texto: "Fecha: más recientes primero" },
  { valor: "fecha-asc", texto: "Fecha: más antiguos primero" },
  { valor: "total-desc", texto: "Asistencia: de mayor a menor" },
  { valor: "total-asc", texto: "Asistencia: de menor a mayor" },
];

const FILTROS_INICIALES = { fecha: "", tipo: "", mes: "", anio: "", orden: "fecha-desc" };

// El total siempre se calcula, nunca se guarda por separado
function totalDe(registro) {
  return registro.hermanos + registro.visitas + registro.ninos + registro.adolescentes;
}

function nombreDelTipo(id) {
  // "?." evita un error si no se encuentra el tipo; "??" da un texto por defecto
  return tiposCultoDemo.find((tipo) => tipo.id === id)?.nombre ?? "Desconocido";
}

function posicionDelTipo(id) {
  return tiposCultoDemo.findIndex((tipo) => tipo.id === id);
}

// Devuelve una COPIA ordenada. Se copia con [...lista] porque .sort()
// modifica la lista original y no queremos alterar el estado de React.
function ordenar(lista, orden) {
  const copia = [...lista];
  copia.sort((a, b) => {
    let diferencia = 0;
    if (orden === "fecha-desc") diferencia = b.fecha.localeCompare(a.fecha);
    else if (orden === "fecha-asc") diferencia = a.fecha.localeCompare(b.fecha);
    else if (orden === "total-desc") diferencia = totalDe(b) - totalDe(a);
    else diferencia = totalDe(a) - totalDe(b);

    // Desempate: dos cultos del mismo día quedan en el orden de la lista de tipos
    if (diferencia !== 0) return diferencia;
    return posicionDelTipo(a.tipoCultoId) - posicionDelTipo(b.tipoCultoId);
  });
  return copia;
}

export default function TablaRegistros() {
  // Los registros viven en el estado para poder eliminar uno y ver el cambio.
  const [registros, setRegistros] = useState(registrosDemo);
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [detalle, setDetalle] = useState(null); // registro que se está viendo, o null
  const [porEliminar, setPorEliminar] = useState(null); // registro pendiente de confirmar
  const [aviso, setAviso] = useState("");

  // Años disponibles en los datos, sin repetir (Set) y del más reciente al más antiguo
  const anios = [...new Set(registros.map((r) => r.fecha.slice(0, 4)))].sort().reverse();

  function cambiarFiltro(evento) {
    const { name, value } = evento.target;
    setFiltros((anteriores) => ({ ...anteriores, [name]: value }));
  }

  // .filter se queda solo con los registros que cumplen TODAS las condiciones activas
  const filtrados = registros.filter((r) => {
    if (filtros.fecha && r.fecha !== filtros.fecha) return false;
    if (filtros.tipo && r.tipoCultoId !== filtros.tipo) return false;
    // "2026-10-25".slice(5, 7) es "10"; restamos 1 para que enero sea 0
    if (filtros.mes !== "" && Number(r.fecha.slice(5, 7)) - 1 !== Number(filtros.mes)) return false;
    if (filtros.anio && r.fecha.slice(0, 4) !== filtros.anio) return false;
    return true;
  });

  const visibles = ordenar(filtrados, filtros.orden);
  const hayFiltros =
    filtros.fecha || filtros.tipo || filtros.mes !== "" || filtros.anio;

  function pedirEdicion() {
    setAviso("Demostración: la edición se conectará al formulario en la Fase 5.");
  }

  function confirmarEliminar() {
    // Creamos una lista nueva SIN el registro eliminado
    setRegistros((anteriores) => anteriores.filter((r) => r.id !== porEliminar.id));
    setAviso(
      `Registro del ${formatearFecha(porEliminar.fecha)} eliminado. ` +
        "(Demostración: al recargar la página vuelve a aparecer.)"
    );
    setPorEliminar(null);
  }

  // Datos que se muestran en la ventana de detalle
  const filasDetalle = detalle
    ? [
        ["Fecha", formatearFecha(detalle.fecha)],
        ["Tipo de culto", nombreDelTipo(detalle.tipoCultoId)],
        ["Hermanos", detalle.hermanos],
        ["Visitas", detalle.visitas],
        ["Niños", detalle.ninos],
        ["Adolescentes", detalle.adolescentes],
        ["Total de asistentes", totalDe(detalle)],
        // null = no se registró (distinto de 0)
        ["Ofrenda", detalle.ofrenda !== null ? formatearPesos(detalle.ofrenda) : "No registrada"],
        ["Dirigió el culto", detalle.dirigio || "No registrado"],
        ["Predicó", detalle.predico || "No registrado"],
        ["Lema", detalle.lema || "No registrado"],
        ["Tema de la predicación", detalle.tema || "No registrado"],
        ["Observaciones", detalle.observaciones || "Sin observaciones"],
        ["Registrado por", detalle.registradoPor],
      ]
    : [];

  return (
    <>
      <p className={styles.aviso}>
        <Info size={18} aria-hidden="true" />
        <span>
          <strong>Datos de demostración:</strong> estos registros son ficticios.
        </span>
      </p>

      {aviso && (
        <p className={styles.mensaje} role="status">
          <CircleCheck size={18} aria-hidden="true" />
          <span>{aviso}</span>
        </p>
      )}

      {/* ---------- Filtros ---------- */}
      <section className={styles.filtros} aria-label="Filtros">
        <label className={styles.etiqueta}>
          Buscar por fecha
          <input
            type="date"
            name="fecha"
            value={filtros.fecha}
            onChange={cambiarFiltro}
            className={styles.control}
          />
        </label>

        <label className={styles.etiqueta}>
          Tipo de culto
          <select name="tipo" value={filtros.tipo} onChange={cambiarFiltro} className={styles.control}>
            <option value="">Todos</option>
            {tiposCultoDemo.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.etiqueta}>
          Mes
          <select name="mes" value={filtros.mes} onChange={cambiarFiltro} className={styles.control}>
            <option value="">Todos</option>
            {MESES.map((nombre, indice) => (
              <option key={nombre} value={indice}>
                {nombre}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.etiqueta}>
          Año
          <select name="anio" value={filtros.anio} onChange={cambiarFiltro} className={styles.control}>
            <option value="">Todos</option>
            {anios.map((anio) => (
              <option key={anio} value={anio}>
                {anio}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.etiqueta}>
          Ordenar por
          <select name="orden" value={filtros.orden} onChange={cambiarFiltro} className={styles.control}>
            {ORDENES.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.texto}
              </option>
            ))}
          </select>
        </label>

        {hayFiltros && (
          <button
            type="button"
            className={styles.limpiar}
            onClick={() => setFiltros({ ...FILTROS_INICIALES, orden: filtros.orden })}
          >
            Limpiar filtros
          </button>
        )}
      </section>

      <p className={styles.contador}>
        Mostrando {visibles.length} de {registros.length} registros
      </p>

      {/* ---------- Tabla o estado vacío ---------- */}
      {visibles.length === 0 ? (
        <div className={styles.vacio}>
          <p className={styles.vacioTitulo}>No hay registros para mostrar</p>
          <p>
            {hayFiltros
              ? "Ningún registro coincide con los filtros elegidos."
              : "Todavía no se ha registrado ningún culto."}
          </p>
        </div>
      ) : (
        // El contenedor permite hacer scroll horizontal en pantallas pequeñas
        <div className={styles.contenedorTabla}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th scope="col">Fecha</th>
                <th scope="col">Tipo de culto</th>
                <th scope="col" className={styles.numero}>Hermanos</th>
                <th scope="col" className={styles.numero}>Visitas</th>
                <th scope="col" className={styles.numero}>Niños</th>
                <th scope="col" className={styles.numero}>Adolesc.</th>
                <th scope="col" className={styles.numero}>Total</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((r) => {
                // Texto que identifica al registro para los lectores de pantalla
                const descripcion = `${nombreDelTipo(r.tipoCultoId)} del ${formatearFecha(r.fecha)}`;
                return (
                  <tr key={r.id}>
                    <td>{formatearFecha(r.fecha)}</td>
                    <td>{nombreDelTipo(r.tipoCultoId)}</td>
                    <td className={styles.numero}>{r.hermanos}</td>
                    <td className={styles.numero}>{r.visitas}</td>
                    <td className={styles.numero}>{r.ninos}</td>
                    <td className={styles.numero}>{r.adolescentes}</td>
                    <td className={`${styles.numero} ${styles.total}`}>{totalDe(r)}</td>
                    <td>
                      <div className={styles.acciones}>
                        <button
                          type="button"
                          className={styles.accion}
                          onClick={() => setDetalle(r)}
                          aria-label={`Ver detalle: ${descripcion}`}
                          title="Ver detalle"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          type="button"
                          className={styles.accion}
                          onClick={pedirEdicion}
                          aria-label={`Editar: ${descripcion}`}
                          title="Editar"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          type="button"
                          className={`${styles.accion} ${styles.peligro}`}
                          onClick={() => setPorEliminar(r)}
                          aria-label={`Eliminar: ${descripcion}`}
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ---------- Ventana de detalle ---------- */}
      {detalle && (
        <Modal titulo="Detalle del registro" onCerrar={() => setDetalle(null)}>
          <dl className={styles.detalle}>
            {filasDetalle.map(([etiqueta, valor]) => (
              <div key={etiqueta} className={styles.filaDetalle}>
                <dt>{etiqueta}</dt>
                <dd>{valor}</dd>
              </div>
            ))}
          </dl>
        </Modal>
      )}

      {/* ---------- Confirmación antes de eliminar ---------- */}
      {porEliminar && (
        <Modal titulo="¿Eliminar este registro?" onCerrar={() => setPorEliminar(null)}>
          <p className={styles.textoConfirmar}>
            Vas a eliminar el registro de <strong>{nombreDelTipo(porEliminar.tipoCultoId)}</strong>{" "}
            del <strong>{formatearFecha(porEliminar.fecha)}</strong> (
            {totalDe(porEliminar)} asistentes).
          </p>
          <div className={styles.botonesConfirmar}>
            <button type="button" className={styles.cancelar} onClick={() => setPorEliminar(null)}>
              Cancelar
            </button>
            <button type="button" className={styles.eliminar} onClick={confirmarEliminar}>
              Sí, eliminar
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}