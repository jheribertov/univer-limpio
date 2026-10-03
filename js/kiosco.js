const video = document.getElementById("video");
const URL_BACKEND = "https://univer-credencial-production.up.railway.app";
const mensaje = document.getElementById("mensajeKiosco");
const camaraInactiva = document.getElementById("camaraInactiva");
let flujoCamara = null;
let intervaloLectura = null;

async function consultarCredencial(valor) {
    const matricula = String(valor).replace("UNIVERPASS:", "").trim();
    if (!matricula) {
        mostrarError("Por favor ingresa una matrícula válida.");
        return;
    }

    try {
const respuesta = await fetch(`${URL_BACKEND}?sheet=REGISTROS`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ codigo: matricula })
        });
        const resultado = await respuesta.json();

        if (resultado.valido) {
            detenerCamara();
            // Guardamos temporalmente los datos si tu app los usa en aula.html
            sessionStorage.setItem("datosCredencial", JSON.stringify(resultado.data));
            window.location.href = "aula.html";
        } else {
            mostrarError(resultado.mensaje || "El código o matrícula no se encuentra registrado.");
        }
    } catch (error) {
        mostrarError("Error de conexión con el servidor. Inténtalo de nuevo.");
        console.error(error);
    }
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
document.getElementById("probarEjemplo").addEventListener("click",()=>{const datos = JSON.parse(sessionStorage.getItem("datosCredencial"));if(datos)consultarCredencial(datos.matricula);else mostrarError("Primero registra o consulta una credencial.");});
window.addEventListener("DOMContentLoaded",iniciarCamara); window.addEventListener("beforeunload",detenerCamara);

// --- Entrada manual de matrícula ---
const manualInput = document.getElementById('manualInput');
const btnManual = document.getElementById('btnManual');

if (btnManual && manualInput) {
  btnManual.addEventListener('click', () => {
    const matricula = manualInput.value.trim();
    if (matricula) {
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