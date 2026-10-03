const datos = UniverPass.obtener();
const boton = document.getElementById("descargarCredencial");
const setCredencial = document.getElementById("credencial");
function tipoPorMatricula(matricula){const v=String(matricula||"").trim().toUpperCase();if(v.startsWith("A"))return{clase:"tipo-administrativo",texto:"ADMINISTRATIVO"};if(v.startsWith("P"))return{clase:"tipo-academico",texto:"ACADÉMICO"};return{clase:"tipo-alumno",texto:"ALUMNO"}}
if(!datos){
  document.getElementById("sinDatos").hidden=false;setCredencial.hidden=true;boton.disabled=true;
}else{
  document.getElementById("credFoto").src=datos.foto;
  document.getElementById("credNombre").textContent=datos.nombre;
  document.getElementById("credCarrera").textContent=datos.carrera;
  document.getElementById("credMatriculaFrente").textContent=datos.matricula;
  document.getElementById("credContactoAlumno").textContent=datos.contactoAlumno || "—";
  document.getElementById("credCorreo").textContent=datos.correo;
  document.getElementById("credContactoEmergencia").textContent=datos.contactoEmergencia || "—";
  document.getElementById("credFirmaAlumno").src=datos.firma;
  const tipo=tipoPorMatricula(datos.matricula);
  document.getElementById("credencialFrente").classList.add(tipo.clase);
  const fondoFrente=document.querySelector("#credencialFrente .plantilla-fondo");
  if(tipo.clase==="tipo-administrativo") fondoFrente.src="assets/credencial-frente-administrativo.jpg";
  else if(tipo.clase==="tipo-academico") fondoFrente.src="assets/credencial-frente-academico.jpg";
  else fondoFrente.src="assets/credencial-frente.jpg";
  document.getElementById("credencialReverso").classList.add(tipo.clase);
  document.getElementById("tipoUsuario").textContent=tipo.texto;
  if(window.QRCode)new QRCode(document.getElementById("codigoQr"),{text:datos.qr,width:180,height:180,colorDark:"#082a61",colorLight:"#ffffff",correctLevel:QRCode.CorrectLevel.M});
}
boton.addEventListener("click", async () => {
  if (!datos) return;
  if (!window.html2canvas) {
    alert("Se necesita conexión a internet para preparar las imágenes.");
    return;
  }

  boton.disabled = true;
  const textoOriginal = boton.textContent;
  boton.textContent = "Preparando imágenes...";

  try {
    const imagenes = [...document.querySelectorAll("#credencial img")];
    await Promise.all(imagenes.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", resolve, { once: true });
      });
    }));

    await new Promise(resolve => setTimeout(resolve, 250));

    const opciones = { scale: 3, backgroundColor: "#ffffff", useCORS: true, logging: false };
    const frente = await html2canvas(document.getElementById("credencialFrente"), opciones);
    const reverso = await html2canvas(document.getElementById("credencialReverso"), opciones);

    const descargarPNG = (canvas, nombre) => {
      const enlace = document.createElement("a");
      enlace.download = nombre;
      enlace.href = canvas.toDataURL("image/png");
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
    };

    descargarPNG(frente, `UniverPass-${datos.matricula}-frente.png`);
    await new Promise(resolve => setTimeout(resolve, 350));
    descargarPNG(reverso, `UniverPass-${datos.matricula}-reverso.png`);
  } catch (error) {
    console.error(error);
    alert("No se pudieron generar las imágenes. Intenta nuevamente.");
  } finally {
    boton.disabled = false;
    boton.textContent = textoOriginal;
  }
});
