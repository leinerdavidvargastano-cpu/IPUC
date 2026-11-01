"use client"; // usa estado, efectos y navegacion

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleAlert, KeyRound } from "lucide-react";
import styles from "./FormularioLogin.module.css"; // misma apariencia que el login

export default function FormularioCambiarClave() {
  const router = useRouter();
  // estado puede ser: "cargando", "listo" o "error"
  const [estado, setEstado] = useState("cargando");
  // true si la persona entro con una contrasena temporal
  const [obligatorio, setObligatorio] = useState(false);

  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [repetida, setRepetida] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Al abrir la pagina comprobamos que haya sesion y si es obligatorio cambiarla
  useEffect(() => {
    let activo = true;

    fetch("/api/auth/yo")
      .then(async (respuesta) => {
        if (respuesta.status === 401) {
          router.replace("/login");
          return;
        }

        if (!respuesta.ok) throw new Error("Respuesta no valida");

        const datos = await respuesta.json();
        if (activo) {
          setObligatorio(Boolean(datos.debeCambiarClave));
          setEstado("listo");
        }
      })
      .catch(() => {
        if (activo) setEstado("error");
      });

    return () => {
      activo = false;
    };
  }, [router]);

  async function salir() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/login");
    }
  }

  async function enviar(evento) {
    evento.preventDefault();
    setError("");

    // Revision rapida en el navegador (el servidor aplica las reglas completas)
    if (!actual || !nueva || !repetida) {
      setError("Completa los tres campos.");
      return;
    }

    if (nueva.length < 8) {
      setError("La contraseña nueva debe tener al menos 8 caracteres.");
      return;
    }

    if (nueva !== repetida) {
      setError("La contraseña nueva y su repetición no coinciden.");
      return;
    }

    setEnviando(true);
    try {
      const respuesta = await fetch("/api/auth/cambiar-clave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contrasenaActual: actual, contrasenaNueva: nueva }),
      });

      // 204 = cambiada. Entramos al panel.
      if (respuesta.status === 204) {
        router.replace("/inicio");
        return;
      }

      // 401 = la sesion vencio
      if (respuesta.status === 401) {
        router.replace("/login");
        return;
      }

      // 400 (contrasena actual incorrecta, nueva no permitida), 429, etc.
      const datos = await respuesta.json().catch(() => ({}));
      setError(datos.mensaje || "No se pudo cambiar la contraseña.");
    } catch {
      setError("No se pudo conectar con el servidor. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  if (estado !== "listo") {
    return (
      <main className={styles.pagina}>
        <div className={styles.tarjeta} role={estado === "error" ? "alert" : "status"}>
          <p className={styles.subtitulo}>
            {estado === "error"
              ? "No se pudo verificar la sesión. Revisa que el servidor esté encendido y recarga la página."
              : "Cargando..."}
          </p>
        </div>
      </main>
    );
  }

  const tipoCampo = mostrar ? "text" : "password";

  return (
    <main className={styles.pagina}>
      <form className={styles.tarjeta} onSubmit={enviar} noValidate>
        <span className={styles.logo}>
          <KeyRound size={26} aria-hidden="true" />
        </span>
        <h1 className={styles.titulo}>Cambiar contraseña</h1>
        <p className={styles.subtitulo}>
          {obligatorio
            ? "Tu contraseña es temporal. Elige una propia para continuar."
            : "Elige una contraseña nueva para tu cuenta."}
        </p>

        {obligatorio && (
          <p className={styles.aviso}>
            Escribe como «contraseña actual» la que te entregó el administrador.
          </p>
        )}

        {error && (
          <p className={styles.error} role="alert">
            <CircleAlert size={18} aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}

        <label className={styles.etiqueta} htmlFor="actual">
          Contraseña actual
        </label>
        <input
          id="actual"
          type={tipoCampo}
          autoComplete="current-password"
          className={styles.entrada}
          value={actual}
          onChange={(evento) => setActual(evento.target.value)}
        />

        <label className={styles.etiqueta} htmlFor="nueva">
          Contraseña nueva
        </label>
        <input
          id="nueva"
          type={tipoCampo}
          autoComplete="new-password"
          className={styles.entrada}
          value={nueva}
          onChange={(evento) => setNueva(evento.target.value)}
        />
        <p className={styles.ayuda}>
          Mínimo 8 caracteres. Puede ser una frase fácil de recordar, por ejemplo:
          «mi iglesia es mi hogar». No uses 12345678, tu nombre ni tu correo.
        </p>

        <label className={styles.etiqueta} htmlFor="repetida">
          Repite la contraseña nueva
        </label>
        <input
          id="repetida"
          type={tipoCampo}
          autoComplete="new-password"
          className={styles.entrada}
          value={repetida}
          onChange={(evento) => setRepetida(evento.target.value)}
        />

        <label className={styles.mostrar}>
          <input
            type="checkbox"
            checked={mostrar}
            onChange={(evento) => setMostrar(evento.target.checked)}
          />
          Mostrar las contraseñas mientras escribo
        </label>

        <button type="submit" className={styles.boton} disabled={enviando}>
          {enviando ? "Guardando..." : "Guardar contraseña nueva"}
        </button>

        {obligatorio ? (
          <button type="button" className={styles.enlaceSecundario} onClick={salir}>
            Salir
          </button>
        ) : (
          <Link href="/inicio" className={styles.enlaceSecundario}>
            Volver
          </Link>
        )}
      </form>
    </main>
  );
}