"use client"; // usa useEffect y eventos del navegador

import { useEffect } from "react";
import { X } from "lucide-react";
import styles from "./Modal.module.css";

// Props:
// - titulo:   título de la ventana
// - onCerrar: función que se ejecuta para cerrarla
// - children: el contenido que va dentro
export default function Modal({ titulo, onCerrar, children }) {
  // useEffect ejecuta código "de efecto" al mostrarse el componente.
  // Aquí escuchamos la tecla Escape para cerrar la ventana.
  useEffect(() => {
    function alPulsarTecla(evento) {
      if (evento.key === "Escape") onCerrar();
    }
    document.addEventListener("keydown", alPulsarTecla);

    // La función que devolvemos se ejecuta al cerrar la ventana:
    // quita el "oyente" para que no se acumulen.
    return () => document.removeEventListener("keydown", alPulsarTecla);
  }, [onCerrar]);

  return (
    // Al hacer clic en el fondo oscuro, se cierra
    <div className={styles.fondo} onClick={onCerrar}>
      {/* stopPropagation evita que un clic DENTRO de la ventana cierre el fondo */}
      <div
        className={styles.ventana}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className={styles.cabecera}>
          <h2 className={styles.titulo}>{titulo}</h2>
          <button
            type="button"
            className={styles.cerrar}
            onClick={onCerrar}
            aria-label="Cerrar ventana"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}