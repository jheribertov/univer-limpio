const video = document.getElementById("video");
const URL_BACKEND = "";
const mensaje = document.getElementById("mensajeKiosco");
const camaraInactiva = document.getElementById("camaraInactiva");
let flujoCamara = null;
let intervaloLectura = null;

function consultarCredencial(valor) {
    const datos = UniverPass.obtener();
    const matricula = String(valor).replace("UNIVERPASS:", "").trim();
    if (datos && String(datos.matricula).toLowerCase() === matricula.toLowerCase()) {
        UniverPass.seleccionar(datos); detenerCamara(); window.location.href = "aula.html"; return;
    }
    mostrarError("El código QR no corresponde a una credencial registrada.");
}
async function iniciarCamara() {
    if (!navigator.mediaDevices?.getUserMedia) return mostrarError("Este navegador no permite utilizar la cámara.");
    detenerCamara(); camaraInactiva.hidden = false; camaraInactiva.textContent = "Activando cámara frontal…";
    try {
        flujoCamara = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "user" } }, audio: false });
        video.srcObject = flujoCamara; await video.play(); camaraInactiva.hidden = true; video.style.transform = "scaleX(-1)";
        if (!("BarcodeDetector" in window)) return mostrarError("Tu navegador no admite lectura automática de QR. Abre el kiosco en Chrome o Edge actualizado.");
        const lector = new BarcodeDetector({ formats: ["qr_code"] });
        intervaloLectura = window.setInterval(async () => { try { const codigos = await lector.detect(video); if (codigos.length) consultarCredencial(codigos[0].rawValue); } catch {} }, 700);
    } catch { mostrarError("No fue posible activar la cámara frontal. Revisa los permisos de cámara del navegador."); }
}
function detenerCamara(){ window.clearInterval(intervaloLectura); intervaloLectura=null; if(flujoCamara) flujoCamara.getTracks().forEach(p=>p.stop()); flujoCamara=null; video.srcObject=null; }
function mostrarError(texto){ mensaje.textContent=texto; mensaje.className="mensaje error advertencia"; }
document.getElementById("formConsulta").addEventListener("submit",e=>{e.preventDefault();consultarCredencial(document.getElementById("consultaMatricula").value)});
document.getElementById("probarEjemplo").addEventListener("click",()=>{const datos=UniverPass.obtener();if(datos)consultarCredencial(datos.matricula);else mostrarError("Primero crea una credencial desde la página principal.")});
window.addEventListener("DOMContentLoaded",iniciarCamara); window.addEventListener("beforeunload",detenerCamara);
// --- Entrada manual de matrícula ---
const manualInput = document.getElementById('manualInput');
const btnManual = document.getElementById('btnManual');

if (btnManual && manualInput) {
  btnManual.addEventListener('click', () => {
    const matricula = manualInput.value.trim();
    if (matricula) {
      // Llamamos a la misma función que procesa la consulta de la credencial
      consultarCredencial(matricula); 
      manualInput.value = '';
    }
  });

  manualInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const matricula = manualInput.value.trim();
      if (matricula) {
        consultarCredencial(matricula);
        manualInput.value = '';
      }
    }
  });
}