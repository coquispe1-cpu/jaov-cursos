let CursoSeleccionado = "";
let PrecioCurso = 0;

function seleccionarCurso(nombre, precio) {
  CursoSeleccionado = nombre;
  PrecioCurso = precio;
  document.getElementById("cursoSeleccionado").value = nombre;
  document.getElementById("precioCurso").value = precio;
  window.location.href = "#registro";
}

const forma = document.getElementById("registroForm");
forma.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = forma.nombre.value;
  const correo = forma.correo.value;

  const respuesta = await fetch("/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, correo, curso: CursoSeleccionado, precio: PrecioCurso })
  });

  const datos = await respuesta.json();
  if (datos.url) window.location.href = datos.url;
});
