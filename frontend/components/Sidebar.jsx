"use client"; // usePathname necesita ejecutarse en el navegador

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, Table, UsersRound, LifeBuoy } from "lucide-react";
import EstadoServidor from "./EstadoServidor";
import { useSesion } from "./SesionProvider";
import styles from "./Sidebar.module.css";

// Lista de secciones del menu. "soloAdmin" oculta el enlace a los secretarios.
const enlaces = [
  { href: "/inicio", texto: "Inicio", Icono: LayoutDashboard },
  { href: "/llenar-datos", texto: "Llenar datos", Icono: ClipboardList },
  { href: "/ver-datos", texto: "Ver datos", Icono: Table },
  { href: "/cuentas", texto: "Cuentas", Icono: UsersRound, soloAdmin: true },
  { href: "/ayuda", texto: "Ayuda", Icono: LifeBuoy },
];

export default function Sidebar({ abierto, onCerrar }) {
  // usePathname devuelve la URL actual (por ejemplo "/inicio").
  // La usamos para resaltar el enlace de la seccion donde estamos.
  const rutaActual = usePathname();
  const { usuario } = useSesion();

  // Cada persona ve solo las secciones que le corresponden
  const visibles = enlaces.filter((enlace) => !enlace.soloAdmin || usuario.rol === "admin");

  return (
    <>
      {/* Fondo oscuro detras del menu en celulares; al tocarlo, se cierra */}
      <div
        className={`${styles.fondo} ${abierto ? styles.fondoVisible : ""}`}
        onClick={onCerrar}
      />

      <aside className={`${styles.sidebar} ${abierto ? styles.abierto : ""}`}>
        <div className={styles.marca}>
          <span className={styles.logo}>IPUC</span>
          <div>
            <p className={styles.nombre}>Sistema de Asistencia</p>
            <p className={styles.subtitulo}>Panel de secretaría</p>
          </div>
        </div>

        <nav className={styles.nav} aria-label="Navegación principal">
          {visibles.map(({ href, texto, Icono }) => {
            const activo = rutaActual === href || rutaActual.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                onClick={onCerrar}
                aria-current={activo ? "page" : undefined}
                className={`${styles.enlace} ${activo ? styles.activo : ""}`}
              >
                <Icono size={20} aria-hidden="true" />
                {texto}
              </Link>
            );
          })}
        </nav>

        <EstadoServidor />
        <p className={styles.pie}>Versión de demostración</p>
      </aside>
    </>
  );
}