import EncabezadoPagina from "@/components/EncabezadoPagina";
import EditarCulto from "@/components/EditarCulto";

// En Next.js, "params" trae lo que va en los corchetes de la carpeta:
// /ver-datos/5/editar  ->  params = { id: "5" }
// Hay que esperarlo con "await" (es una promesa).
export default async function EditarPage({ params }) {
  const { id } = await params;

  return (
    <>
      <EncabezadoPagina
        titulo="Editar registro"
        descripcion="Corrige los datos del culto y guarda los cambios."
      />
      <EditarCulto id={id} />
    </>
  );
}