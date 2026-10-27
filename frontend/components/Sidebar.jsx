"use client"; // usePathname necesita ejecutarse en el navegador

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, Table, LifeBuoy } from "lucide-react";
import styles from "./Sidebar.module.css";

// Lista de secciones del menú. Si algún día agregamos otra sección,
// solo se añade un elemento aquí.
const enlaces = [
  { href: "/inicio", texto: "Inicio", Icono: LayoutDashboard },
  { href: "/llenar-datos", texto: "Llenar datos", Icono: ClipboardList },
  { href: "/ver-datos", texto: "Ver datos", Icono: Table },
  { href: "/ayuda", texto: "Ayuda", Icono: LifeBuoy },
];

export default function Sidebar({ abierto, onCerrar }) {
  // usePathname devuelve la URL actual (por ejemplo "/inicio").
  // La usamos para resaltar el enlace de la sección donde estamos.
  const rutaActual = usePathname();

  return (
    <>
      {/* Fondo oscuro detrás del menú en celulares; al tocarlo, se cierra */}
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
          {/* .map recorre la lista y crea un enlace por cada elemento */}
          {enlaces.map(({ href, texto, Icono }) => {
            const activo = rutaActual === href;
            return (
              <Link
                key={href} // React necesita una "key" única en cada elemento de una lista
                href={href}
                onClick={onCerrar} // en celular, cierra el menú al elegir una sección
                aria-current={activo ? "page" : undefined}
                className={`${styles.enlace} ${activo ? styles.activo : ""}`}
              >
                <Icono size={20} aria-hidden="true" />
                {texto}
              </Link>
            );
          })}
        </nav>

        <p className={styles.pie}>Versión de demostración</p>
      </aside>
    </>
  );
}