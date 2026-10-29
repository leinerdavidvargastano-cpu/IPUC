// Igual que fetch, pero si el servidor responde 401 (la sesion vencio o
// fue cerrada) lleva a la persona a la pantalla de inicio de sesion.
// Se usa en todas las peticiones a la API, MENOS en el login mismo
// (alli un 401 solo significa "contrasena incorrecta").
export async function fetchApi(url, opciones) {
  const respuesta = await fetch(url, opciones);

  if (respuesta.status === 401) {
    window.location.assign("/login");
  }

  return respuesta;
}