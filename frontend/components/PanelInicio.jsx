"use client"; // guarda los filtros en el estado, que solo existe en el navegador

import { useState } from "react";
import ResumenInicio from "./ResumenInicio";
import GraficaGeneral from "./GraficaGeneral";

// Las tarjetas son duenas del filtro de periodo y avisan cada vez que cambia.
// Aqui lo guardamos para pasarselo tambien a la grafica general.
export default function PanelInicio() {
  const [filtros, setFiltros] = useState(null);

  return (
    <>
      <ResumenInicio alCambiarFiltros={setFiltros} />
      <GraficaGeneral filtros={filtros} />
    </>
  );
}