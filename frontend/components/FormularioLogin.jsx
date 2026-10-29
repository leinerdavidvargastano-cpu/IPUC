"use client"; // usa estado y eventos del navegador

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, LogIn } from "lucide-react";
import styles from "./FormularioLogin.module.css";

export default function FormularioLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento) {
    evento.preventDefault(); // evita que el navegador recargue la pagina
    setError("");

    if (!email.trim() || !contrasena) {
      setError("Escribe tu correo y tu contraseña.");
      return;
    }

    setEnviando(true);
    try {
      const respuesta = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), contrasena }),
      });

      // Todo bien: el servidor dejo la cookie de sesion. Entramos al panel.
      if (respuesta.ok) {
        router.replace("/inicio");
        return;
      }

      // 401 (datos incorrectos), 429 (demasiados intentos), etc.
      const datos = await respuesta.json().catch(() => ({}));
      setError(datos.mensaje || "No se pudo iniciar sesión.");
      setContrasena(""); // por seguridad, se borra la contrasena escrita
    } catch {
      setError("No se pudo conectar con el servidor. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className={styles.pagina}>
      <form className={styles.tarjeta} onSubmit={enviar} noValidate>
        <span className={styles.logo}>IPUC</span>
        <h1 className={styles.titulo}>Sistema de Asistencia</h1>
        <p className={styles.subtitulo}>Acceso para secretarios autorizados</p>

        {error && (
          <p className={styles.error} role="alert">
            <CircleAlert size={18} aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}

        <label className={styles.etiqueta} htmlFor="email">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          className={styles.entrada}
          value={email}
          onChange={(evento) => setEmail(evento.target.value)}
        />

        <label className={styles.etiqueta} htmlFor="contrasena">
          Contraseña
        </label>
        <input
          id="contrasena"
          type="password"
          autoComplete="current-password"
          className={styles.entrada}
          value={contrasena}
          onChange={(evento) => setContrasena(evento.target.value)}
        />

        <button type="submit" className={styles.boton} disabled={enviando}>
          <LogIn size={18} aria-hidden="true" />
          {enviando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}