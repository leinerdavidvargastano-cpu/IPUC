import EncabezadoPagina from "@/components/EncabezadoPagina";
import FormularioAsistencia from "@/components/FormularioAsistencia";

export default function LlenarDatosPage() {
  return (
    <>
      <EncabezadoPagina
        titulo="Llenar datos"
        descripcion="Registra la asistencia y los datos de un culto."
      />
      <FormularioAsistencia />
    </>
  );
}