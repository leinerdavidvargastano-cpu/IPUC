"use client"; // usa estado, efectos y navegacion, que solo existen en el navegador

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Un "contexto" es una forma de compartir datos con todos los componentes
// de adentro, sin pasarlos de uno en uno como props.
const SesionContexto = createContext(null);

// Hook para leer la sesion desde cualquier componente:
//   const { usuario, cerrarSesion } = useSesion();
export function useSesion() {
  return useContext(SesionContexto);
}

const estiloCentrado = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: 16,
  textAlign: "center",
  color: "var(--texto-secundario)",
};

export default function SesionProvider({ children }) {
  const router = useRouter();
  // estado puede ser: "cargando", "autenticado" o "error"
  const [estado, setEstado] = useState("cargando");
  const [usuario, setUsuario] = useState(null);

  // Al abrir el panel preguntamos al servidor quien tiene la sesion abierta
  useEffect(() => {
    let activo = true;

    fetch("/api/auth/yo")
      .then(async (respuesta) => {
        // 401 = no hay sesion valida: a la pantalla de login
        if (respuesta.status === 401) {
          router.replace("/login");
          return;
        }

        if (!respuesta.ok) throw new Error("Respuesta no valida");

        const datos = await respuesta.json();
        if (activo) {
          setUsuario(datos);
          setEstado("autenticado");
        }
      })
      .catch(() => {
        if (activo) setEstado("error");
      });

    return () => {
      activo = false;
    };
  }, [router]);

  async function cerrarSesion() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      // Aunque falle la peticion, llevamos a la persona al login
      router.replace("/login");
    }
  }

  if (estado === "error") {
    return (
      <div style={estiloCentrado} role="alert">
        <p>
          No se pudo verificar la sesión.
          <br />
          Revisa que el servidor esté encendido y recarga la página.
        </p>
      </div>
    );
  }

  // Mientras se comprueba la sesion (o se redirige) no mostramos el panel
  if (estado !== "autenticado") {
    return (
      <div style={estiloCentrado} role="status">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <SesionContexto.Provider value={{ usuario, cerrarSesion }}>
      {children}
    </SesionContexto.Provider>
  );
}