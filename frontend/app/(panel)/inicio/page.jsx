import {
  CalendarCheck,
  Users,
  Gauge,
  Trophy,
  CalendarDays,
  TrendingUp,
  UserPlus,
  Baby,
  Info,
} from "lucide-react";
import EncabezadoPagina from "@/components/EncabezadoPagina";
import TarjetaEstadistica from "@/components/TarjetaEstadistica";
import { resumenDemo } from "@/lib/datosDemo";
import styles from "./inicio.module.css";

export default function InicioPage() {
  const r = resumenDemo; // atajo para escribir menos

  // Si el porcentaje es positivo mostramos "+", y el color depende del signo
  const variacion = r.comparacion.porcentaje;
  const textoVariacion = `${variacion >= 0 ? "+" : ""}${variacion.toLocaleString("es-CO")} %`;

  // Cada elemento de esta lista se convierte en una tarjeta
  const tarjetas = [
    {
      titulo: "Último culto registrado",
      valor: r.ultimoCulto.total,
      detalle: r.ultimoCulto.detalle,
      Icono: CalendarCheck,
    },
    {
      titulo: "Total de asistentes",
      valor: r.totalPeriodo.total.toLocaleString("es-CO"),
      detalle: r.totalPeriodo.detalle,
      Icono: Users,
    },
    {
      titulo: "Promedio de asistencia",
      valor: r.promedio.total,
      detalle: r.promedio.detalle,
      Icono: Gauge,
    },
    {
      titulo: "Mayor asistencia",
      valor: r.mayorAsistencia.nombre,
      detalle: r.mayorAsistencia.detalle,
      Icono: Trophy,
    },
    {
      titulo: "Cultos registrados",
      valor: r.cantidadCultos.total,
      detalle: r.cantidadCultos.detalle,
      Icono: CalendarDays,
    },
    {
      titulo: "Comparación con el período anterior",
      valor: textoVariacion,
      detalle: r.comparacion.detalle,
      Icono: TrendingUp,
      tendencia: variacion >= 0 ? "positiva" : "negativa",
    },
    {
      titulo: "Visitas",
      valor: r.visitas.total,
      detalle: r.visitas.detalle,
      Icono: UserPlus,
    },
    {
      titulo: "Niños y adolescentes",
      valor: r.ninosAdolescentes.total,
      detalle: r.ninosAdolescentes.detalle,
      Icono: Baby,
    },
  ];

  return (
    <>
      <EncabezadoPagina
        titulo="Inicio"
        descripcion="Resumen de la asistencia de la congregación."
      />

      <div className={styles.aviso}>
        <Info size={18} aria-hidden="true" />
        <span>
          <strong>Datos de demostración:</strong> estas cifras son ficticias y se
          reemplazarán por los registros reales.
        </span>
      </div>

      <section className={styles.cuadricula} aria-label="Estadísticas principales">
        {/* .map crea una tarjeta por cada elemento de la lista.
            {...t} le pasa todas las propiedades del objeto como props. */}
        {tarjetas.map((t) => (
          <TarjetaEstadistica key={t.titulo} {...t} />
        ))}
      </section>
    </>
  );
}