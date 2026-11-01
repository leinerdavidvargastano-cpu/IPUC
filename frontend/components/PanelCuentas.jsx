"use client"; // usa estado, efectos y el portapapeles del navegador

import { useEffect, useState } from "react";
import {
  UserPlus,
  KeyRound,
  UserX,
  UserCheck,
  Copy,
  Check,
  CircleAlert,
  CircleCheck,
} from "lucide-react";
import Modal from "./Modal";
import { fetchApi } from "@/lib/api";
import { useSesion } from "./SesionProvider";
import tabla from "./TablaRegistros.module.css"; // reutilizamos estilos de tabla y de confirmacion
import styles from "./PanelCuentas.module.css";

const ROLES = { admin: "Administrador", secretario: "Secretario" };
const CABECERAS = { "Content-Type": "application/json" };

// ------------------------------------------------------------
// Formulario para crear una cuenta nueva (va dentro de una ventana)
// ------------------------------------------------------------
function FormularioCuenta({ alCrear, alCancelar }) {
  const [valores, setValores] = useState({
    nombreCompleto: "",
    email: "",
    rol: "secretario",
  });
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [enviando, setEnviando] = useState(false);

  function cambiar(evento) {
    const { name, value } = evento.target;
    setValores((anteriores) => ({ ...anteriores, [name]: value }));
    setErrores((anteriores) => ({ ...anteriores, [name]: undefined }));
    setErrorGeneral("");
  }

  async function enviar(evento) {
    evento.preventDefault();
    setErrorGeneral("");

    // Revision rapida en el navegador (el servidor valida todo de nuevo)
    const nuevos = {};
    if (valores.nombreCompleto.trim().length < 3) {
      nuevos.nombreCompleto = "Escribe el nombre completo.";
    }
    if (!valores.email.trim()) {
      nuevos.email = "Escribe el correo electrónico.";
    }
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;

    setEnviando(true);
    try {
      const respuesta = await fetchApi("/api/usuarios", {
        method: "POST",
        headers: CABECERAS,
        body: JSON.stringify(valores),
      });
      const datos = await respuesta.json();

      // 201 = cuenta creada: avisamos con la contrasena temporal
      if (respuesta.status === 201) {
        alCrear(datos);
        return;
      }

      // 400 = el servidor rechazo algun campo
      if (respuesta.status === 400 && Array.isArray(datos.errores)) {
        const delServidor = {};
        for (const problema of datos.errores) {
          delServidor[problema.campo] = problema.mensaje;
        }
        setErrores(delServidor);
        return;
      }

      // Otros casos (por ejemplo 409: el correo ya existe)
      setErrorGeneral(datos.mensaje || "No se pudo crear la cuenta.");
    } catch {
      setErrorGeneral("No se pudo conectar con el servidor. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} noValidate>
      {errorGeneral && (
        <p className={styles.errorGeneral} role="alert">
          {errorGeneral}
        </p>
      )}

      <div className={styles.campo}>
        <label className={styles.etiqueta} htmlFor="nombreCompleto">
          Nombre completo
        </label>
        <input
          id="nombreCompleto"
          name="nombreCompleto"
          type="text"
          maxLength={150}
          value={valores.nombreCompleto}
          onChange={cambiar}
          className={`${styles.entrada} ${errores.nombreCompleto ? styles.entradaError : ""}`}
        />
        {errores.nombreCompleto && <p className={styles.errorCampo}>{errores.nombreCompleto}</p>}
      </div>

      <div className={styles.campo}>
        <label className={styles.etiqueta} htmlFor="email">
          Correo electrónico
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="off"
          value={valores.email}
          onChange={cambiar}
          className={`${styles.entrada} ${errores.email ? styles.entradaError : ""}`}
        />
        {errores.email && <p className={styles.errorCampo}>{errores.email}</p>}
      </div>

      <div className={styles.campo}>
        <label className={styles.etiqueta} htmlFor="rol">
          Rol
        </label>
        <select
          id="rol"
          name="rol"
          value={valores.rol}
          onChange={cambiar}
          className={styles.entrada}
        >
          <option value="secretario">Secretario (registra y edita cultos)</option>
          <option value="admin">Administrador (además elimina y administra cuentas)</option>
        </select>
        {errores.rol && <p className={styles.errorCampo}>{errores.rol}</p>}
      </div>

      <div className={tabla.botonesConfirmar}>
        <button type="button" className={tabla.cancelar} onClick={alCancelar} disabled={enviando}>
          Cancelar
        </button>
        <button type="submit" className={styles.confirmar} disabled={enviando}>
          {enviando ? "Creando..." : "Crear cuenta"}
        </button>
      </div>
    </form>
  );
}

// ------------------------------------------------------------
// Ventana que muestra la contrasena temporal (solo se ve una vez)
// ------------------------------------------------------------
function ClaveTemporal({ nombre, contrasena, motivo, alCerrar }) {
  const [copiada, setCopiada] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(contrasena);
      setCopiada(true);
    } catch {
      // Si el navegador no deja copiar, la persona puede seleccionarla a mano
      setCopiada(false);
    }
  }

  return (
    <>
      <p className={tabla.textoConfirmar}>
        {motivo === "creada"
          ? `La cuenta de ${nombre} fue creada.`
          : `La contraseña de ${nombre} fue restablecida y su sesión se cerró.`}{" "}
        Esta es su contraseña temporal:
      </p>

      <div className={styles.cajaClave}>
        <p className={styles.clave}>{contrasena}</p>
        <button type="button" className={styles.copiar} onClick={copiar}>
          {copiada ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
          {copiada ? "Copiada" : "Copiar contraseña"}
        </button>
      </div>

      <p className={styles.avisoClave}>
        <strong>Anótala o cópiala ahora:</strong> por seguridad no se vuelve a mostrar. Entrégasela a
        la persona en privado. Si se pierde, usa «Restablecer contraseña» para generar otra.
      </p>

      <div className={tabla.botonesConfirmar}>
        <button type="button" className={styles.confirmar} onClick={alCerrar}>
          Ya la anoté
        </button>
      </div>
    </>
  );
}

// ------------------------------------------------------------
// Pantalla principal
// ------------------------------------------------------------
export default function PanelCuentas() {
  const { usuario } = useSesion();
  const esAdmin = usuario.rol === "admin";

  // "version" sube de a uno cada vez que queremos volver a pedir la lista
  const [version, setVersion] = useState(0);
  const [resultado, setResultado] = useState({ version: null, datos: [], error: false });
  const [aviso, setAviso] = useState(null); // { texto, error } o null
  const [trabajando, setTrabajando] = useState(false);
  // Ventana abierta: null, o un objeto { tipo, ... }
  const [modal, setModal] = useState(null);

  const cargando = resultado.version !== version;

  useEffect(() => {
    if (!esAdmin) return;

    let activo = true;

    fetchApi("/api/usuarios")
      .then((respuesta) => {
        if (!respuesta.ok) throw new Error("Respuesta no valida");
        return respuesta.json();
      })
      .then((datos) => {
        if (activo) setResultado({ version, datos, error: false });
      })
      .catch(() => {
        if (activo) setResultado({ version, datos: [], error: true });
      });

    return () => {
      activo = false;
    };
  }, [version, esAdmin]);

  // Los secretarios no deberian llegar aqui, pero si lo hacen no ven nada
  if (!esAdmin) {
    return (
      <div className={tabla.vacio} role="alert">
        <p className={tabla.vacioTitulo}>Esta sección es solo para administradores</p>
        <p>Si necesitas una cuenta o ayuda con tu contraseña, habla con el administrador.</p>
      </div>
    );
  }

  const cuentas = resultado.datos;

  // Se acaba de crear una cuenta: mostramos su contrasena temporal
  function alCrear(datos) {
    setModal({
      tipo: "clave",
      nombre: datos.usuario.nombreCompleto,
      contrasena: datos.contrasenaTemporal,
      motivo: "creada",
    });
    setVersion((anterior) => anterior + 1);
  }

  async function cambiarEstado(cuenta, activa) {
    setTrabajando(true);
    try {
      const respuesta = await fetchApi(`/api/usuarios/${cuenta.id}/estado`, {
        method: "PATCH",
        headers: CABECERAS,
        body: JSON.stringify({ activo: activa }),
      });
      const datos = await respuesta.json().catch(() => ({}));

      if (respuesta.ok) {
        setAviso({
          texto: activa
            ? `La cuenta de ${cuenta.nombreCompleto} fue activada.`
            : `La cuenta de ${cuenta.nombreCompleto} fue desactivada y su sesión se cerró.`,
          error: false,
        });
        setVersion((anterior) => anterior + 1);
      } else {
        setAviso({ texto: datos.mensaje || "No se pudo cambiar el estado de la cuenta.", error: true });
      }
    } catch {
      setAviso({ texto: "No se pudo conectar con el servidor.", error: true });
    } finally {
      setTrabajando(false);
      setModal(null);
    }
  }

  async function restablecer(cuenta) {
    setTrabajando(true);
    try {
      const respuesta = await fetchApi(`/api/usuarios/${cuenta.id}/restablecer-clave`, {
        method: "POST",
      });
      const datos = await respuesta.json().catch(() => ({}));

      if (respuesta.ok) {
        // Pasamos directo a la ventana que muestra la contrasena nueva
        setModal({
          tipo: "clave",
          nombre: cuenta.nombreCompleto,
          contrasena: datos.contrasenaTemporal,
          motivo: "restablecida",
        });
        setVersion((anterior) => anterior + 1);
      } else {
        setAviso({ texto: datos.mensaje || "No se pudo restablecer la contraseña.", error: true });
        setModal(null);
      }
    } catch {
      setAviso({ texto: "No se pudo conectar con el servidor.", error: true });
      setModal(null);
    } finally {
      setTrabajando(false);
    }
  }

  let contenido;

  if (cargando) {
    contenido = (
      <div className={tabla.vacio} role="status">
        <p>Cargando cuentas...</p>
      </div>
    );
  } else if (resultado.error) {
    contenido = (
      <div className={`${tabla.vacio} ${tabla.errorCarga}`} role="alert">
        <p className={tabla.vacioTitulo}>No se pudieron cargar las cuentas</p>
        <p>Revisa que el servidor esté encendido y recarga la página.</p>
      </div>
    );
  } else {
    contenido = (
      <div className={tabla.contenedorTabla}>
        <table className={tabla.tabla}>
          <thead>
            <tr>
              <th scope="col">Nombre</th>
              <th scope="col">Correo</th>
              <th scope="col">Rol</th>
              <th scope="col">Estado</th>
              <th scope="col">Creada</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cuentas.map((cuenta) => {
              const esPropia = cuenta.id === usuario.id;
              return (
                <tr key={cuenta.id}>
                  <td>
                    {cuenta.nombreCompleto}
                    {esPropia && <span className={styles.tu}>Tú</span>}
                  </td>
                  <td>{cuenta.email}</td>
                  <td>{ROLES[cuenta.rol] ?? cuenta.rol}</td>
                  <td>
                    <span
                      className={`${styles.estado} ${
                        cuenta.activo ? styles.estadoActiva : styles.estadoInactiva
                      }`}
                    >
                      {cuenta.activo ? "Activa" : "Desactivada"}
                    </span>
                  </td>
                  <td>
                    {new Date(cuenta.creadoEn).toLocaleDateString("es-CO", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td>
                    {/* Sobre tu propia cuenta no hay acciones: no puedes desactivarte */}
                    {!esPropia && (
                      <div className={styles.acciones}>
                        <button
                          type="button"
                          className={styles.botonTabla}
                          onClick={() => setModal({ tipo: "restablecer", cuenta })}
                        >
                          <KeyRound size={16} aria-hidden="true" />
                          Restablecer contraseña
                        </button>
                        {cuenta.activo ? (
                          <button
                            type="button"
                            className={`${styles.botonTabla} ${styles.botonPeligro}`}
                            onClick={() => setModal({ tipo: "desactivar", cuenta })}
                          >
                            <UserX size={16} aria-hidden="true" />
                            Desactivar
                          </button>
                        ) : (
                          <button
                            type="button"
                            className={styles.botonTabla}
                            onClick={() => cambiarEstado(cuenta, true)}
                            disabled={trabajando}
                          >
                            <UserCheck size={16} aria-hidden="true" />
                            Activar
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <>
      {aviso && (
        <p
          className={`${tabla.mensaje} ${aviso.error ? tabla.mensajeError : ""}`}
          role={aviso.error ? "alert" : "status"}
        >
          {aviso.error ? (
            <CircleAlert size={18} aria-hidden="true" />
          ) : (
            <CircleCheck size={18} aria-hidden="true" />
          )}
          <span>{aviso.texto}</span>
        </p>
      )}

      <div className={styles.barra}>
        {!cargando && !resultado.error && (
          <p className={styles.contador}>
            {cuentas.length} {cuentas.length === 1 ? "cuenta" : "cuentas"}
          </p>
        )}
        <button
          type="button"
          className={styles.botonCrear}
          onClick={() => setModal({ tipo: "crear" })}
        >
          <UserPlus size={18} aria-hidden="true" />
          Crear cuenta
        </button>
      </div>

      {contenido}

      {/* ---------- Crear cuenta ---------- */}
      {modal?.tipo === "crear" && (
        <Modal titulo="Crear cuenta" onCerrar={() => setModal(null)}>
          <FormularioCuenta alCrear={alCrear} alCancelar={() => setModal(null)} />
        </Modal>
      )}

      {/* ---------- Contrasena temporal ---------- */}
      {modal?.tipo === "clave" && (
        <Modal titulo="Contraseña temporal" onCerrar={() => setModal(null)}>
          <ClaveTemporal
            nombre={modal.nombre}
            contrasena={modal.contrasena}
            motivo={modal.motivo}
            alCerrar={() => setModal(null)}
          />
        </Modal>
      )}

      {/* ---------- Confirmar: restablecer contrasena ---------- */}
      {modal?.tipo === "restablecer" && (
        <Modal titulo="¿Restablecer la contraseña?" onCerrar={() => setModal(null)}>
          <p className={tabla.textoConfirmar}>
            Se creará una contraseña temporal nueva para <strong>{modal.cuenta.nombreCompleto}</strong>.
            La contraseña anterior dejará de funcionar y su sesión abierta se cerrará.
          </p>
          <div className={tabla.botonesConfirmar}>
            <button
              type="button"
              className={tabla.cancelar}
              onClick={() => setModal(null)}
              disabled={trabajando}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={styles.confirmar}
              onClick={() => restablecer(modal.cuenta)}
              disabled={trabajando}
            >
              {trabajando ? "Restableciendo..." : "Sí, restablecer"}
            </button>
          </div>
        </Modal>
      )}

      {/* ---------- Confirmar: desactivar ---------- */}
      {modal?.tipo === "desactivar" && (
        <Modal titulo="¿Desactivar esta cuenta?" onCerrar={() => setModal(null)}>
          <p className={tabla.textoConfirmar}>
            <strong>{modal.cuenta.nombreCompleto}</strong> no podrá entrar al sistema y su sesión
            abierta se cerrará. Sus registros se conservan. Podrás activarla de nuevo cuando quieras.
          </p>
          <div className={tabla.botonesConfirmar}>
            <button
              type="button"
              className={tabla.cancelar}
              onClick={() => setModal(null)}
              disabled={trabajando}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={tabla.eliminar}
              onClick={() => cambiarEstado(modal.cuenta, false)}
              disabled={trabajando}
            >
              {trabajando ? "Desactivando..." : "Sí, desactivar"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}