"use client"; // usa estado y efectos, que solo existen en el navegador

import { useEffect, useState } from "react";
import styles from "./EstadoServidor.module.css";

const TEXTOS = {
  comprobando: "Comprobando servidor...",
  conectado: "Servidor conectado",
  sinConexion: "Sin conexión con el servidor",
};

export default function EstadoServidor() {
  const [estado, setEstado] = useState("comprobando");

  // useEffect con [] al final se ejecuta UNA vez, cuando el componente aparece.
  // Es el lugar correcto para pedir datos a una API.
  useEffect(() => {
    // "activo" evita actualizar el estado si el componente ya desaparecio
    let activo = true;

    // fetch envia la peticion. La ruta "/api/salud" pasa por el puente de Next.
    fetch("/api/salud")
      .then((respuesta) => {
        if (!respuesta.ok) throw new Error("Respuesta no valida");
        return respuesta.json(); // convierte el texto JSON en un objeto
      })
      .then((datos) => {
        if (activo) setEstado(datos.estado === "ok" ? "conectado" : "sinConexion");
      })
      .catch(() => {
        // Si el backend esta apagado, fetch falla y cae aqui
        if (activo) setEstado("sinConexion");
      });

    // Esta funcion se ejecuta cuando el componente desaparece
    return () => {
      activo = false;
    };
  }, []);

  return (
    <p className={styles.estado}>
      <span className={`${styles.punto} ${styles[estado]}`} aria-hidden="true" />
      {TEXTOS[estado]}
    </p>
  );
}