import { redirect } from "next/navigation";

// La ruta "/" no tiene contenido propio: redirige al dashboard
export default function Home() {
  redirect("/inicio");
}