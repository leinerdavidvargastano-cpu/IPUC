import EncabezadoPagina from "@/components/EncabezadoPagina";
import TablaRegistros from "@/components/TablaRegistros";

export default function VerDatosPage() {
  return (
    <>
      <EncabezadoPagina
        titulo="Ver datos"
        descripcion="Consulta, filtra y edita los registros guardados."
      />
      <TablaRegistros />
    </>
  );
}