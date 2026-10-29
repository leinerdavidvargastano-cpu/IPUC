"use client"; // usa el contexto de sesion

import { Menu, UserRound, LogOut } from "lucide-react";
import { useSesion } from "./SesionProvider";
import styles from "./Header.module.css";

// Como se muestra cada rol en pantalla
const ROLES = { admin: "Administrador", secretario: "Secretario" };

// onAbrirMenu: funcion que recibe desde PanelShell para abrir el menu en celulares
export default function Header({ onAbrirMenu }) {
  const { usuario, cerrarSesion } = useSesion();

  return (
    <header className={styles.header}>
      {/* Boton hamburguesa: solo se ve en pantallas pequenas */}
      <button
        type="button"
        className={styles.botonMenu}
        onClick={onAbrirMenu}
        aria-label="Abrir menú"
      >
        <Menu size={22} />
      </button>

      <p className={styles.titulo}>Iglesia Pentecostal Unida de Colombia</p>

      {/* Persona que tiene la sesion abierta */}
      <div className={styles.perfil}>
        <div className={styles.datos}>
          <p className={styles.usuario}>{usuario.nombre}</p>
          <p className={styles.rol}>{ROLES[usuario.rol] ?? usuario.rol}</p>
        </div>
        <span className={styles.avatar}>
          <UserRound size={20} aria-hidden="true" />
        </span>
        <button
          type="button"
          className={styles.salir}
          onClick={cerrarSesion}
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}