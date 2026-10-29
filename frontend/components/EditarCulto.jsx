"use client"; // usa estado y efectos, que solo existen en el navegador

import { useEffect, useState } from "react";
import Link from "next/link";
import FormularioAsistencia from "./FormularioAsistencia";
import estilos from "./FormularioAsistencia.module.css"; // reutilizamos sus estilos
import { fetchApi } from "@/lib/api";


export default function EditarCulto({ id }) {
  // estado puede ser: "cargando", "listo", "noExiste" o "error"
  const [estado, setEstado] = useState("cargando");
  const [culto, setCulto] = useState(null);

  useEffect(() => {
    let activo = true;

    fetchApi(`/api/cultos/${id}`)
      .then(async (respuesta) => {
        // 404 = no existe o fue eliminado; 400 = el id de la direccion no es valido
        if (respuesta.status === 404 || respuesta.status === 400) {
          if (activo) setEstado("noExiste");
          return;
        }

        if (!respuesta.ok) throw new Error("Respuesta no valida");

        const datos = await respuesta.json();
        if (activo) {
          setCulto(datos);
          setEstado("listo");
        }
      })
      .catch(() => {
        if (activo) setEstado("error");
      });

    return () => {
      activo = false;
    };
  }, [id]);

  if (estado === "cargando") {
    return <p role="status">Cargando registro...</p>;
  }

  if (estado === "noExiste" || estado === "error") {
    return (
      <>
        <p className={estilos.mensajeError} role="alert">
          {estado === "noExiste"
            ? "Ese registro no existe o ya fue eliminado."
            : "No se pudo cargar el registro. Revisa que el servidor esté encendido e inténtalo de nuevo."}
        </p>
        <p>
          <Link href="/ver-datos" className={estilos.botonSecundario}>
            Volver a Ver datos
          </Link>
        </p>
      </>
    );
  }

  // Todo listo: mostramos el formulario con los datos del registro
  return <FormularioAsistencia culto={culto} />;
}