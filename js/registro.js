const formulario = document.getElementById("formCredencial");
const videoFoto = document.getElementById("videoFoto");
const activarCamaraFoto = document.getElementById("activarCamaraFoto");
const tomarFoto = document.getElementById("tomarFoto");
const vistaFoto = document.getElementById("vistaFoto");
const fotoVacia = document.getElementById("fotoVacia");
const camaraFotoInactiva = document.getElementById("camaraFotoInactiva");
const mensaje = document.getElementById("mensajeFormulario");
const lienzoFirma = document.getElementById("lienzoFirma");
const contextoFirma = lienzoFirma.getContext("2d");

let fotoBase64 = "";
let flujoCamara = null;
let firmando = false;
let firmaRealizada = false;

const datosAnteriores = UniverPass.obtener();

if (datosAnteriores) {
    ["nombre", "matricula", "correo", "contactoAlumno", "carrera", "campus", "aula", "contactoEmergencia"].forEach((id) => {
        document.getElementById(id).value = datosAnteriores[id] || "";
    });

    if (datosAnteriores.foto) {
        fotoBase64 = datosAnteriores.foto;
        vistaFoto.src = fotoBase64;
        fotoVacia.hidden = true;
    }

    if (datosAnteriores.firma) {
        const imagenFirma = new Image();
        imagenFirma.onload = () => {
            contextoFirma.drawImage(
                imagenFirma,
                0,
                0,
                lienzoFirma.width,
                lienzoFirma.height
            );
        };
        imagenFirma.src = datosAnteriores.firma;
        firmaRealizada = true;
    }
}

activarCamaraFoto.addEventListener("click", async () => {
    mensaje.textContent = "";

    if (!navigator.mediaDevices?.getUserMedia) {
        mostrarError("Este navegador no permite utilizar la cámara.");
        return;
    }

    try {
        flujoCamara = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "user"
            },
            audio: false
        });

        videoFoto.srcObject = flujoCamara;
        await videoFoto.play();

        camaraFotoInactiva.hidden = true;
        activarCamaraFoto.disabled = true;
        tomarFoto.disabled = false;
    } catch (error) {
        mostrarError("No fue posible acceder a la cámara. Revisa los permisos del navegador.");
    }
});

tomarFoto.addEventListener("click", () => {
    if (!videoFoto.videoWidth || !videoFoto.videoHeight) {
        mostrarError("La cámara todavía no está lista.");
        return;
    }

    // Recorte vertical centrado para capturar principalmente el rostro.
    const anchoOrigen = videoFoto.videoWidth;
    const altoOrigen = videoFoto.videoHeight;
    const proporcionDestino = 4 / 5;
    let anchoRecorte = anchoOrigen;
    let altoRecorte = anchoRecorte / proporcionDestino;

    if (altoRecorte > altoOrigen) {
        altoRecorte = altoOrigen;
        anchoRecorte = altoRecorte * proporcionDestino;
    }

    const origenX = (anchoOrigen - anchoRecorte) / 2;
    const origenY = (altoOrigen - altoRecorte) / 2;
    const lienzoFoto = document.createElement("canvas");
    lienzoFoto.width = 480;
    lienzoFoto.height = 600;

    const contextoFoto = lienzoFoto.getContext("2d");
    contextoFoto.drawImage(
        videoFoto,
        origenX, origenY, anchoRecorte, altoRecorte,
        0, 0, lienzoFoto.width, lienzoFoto.height
    );

    fotoBase64 = lienzoFoto.toDataURL("image/jpeg", 0.9);
    vistaFoto.src = fotoBase64;
    fotoVacia.hidden = true;

    detenerCamaraFoto();

    mensaje.textContent = "Fotografía capturada correctamente.";
    mensaje.className = "mensaje";
});

function detenerCamaraFoto() {
    if (flujoCamara) {
        flujoCamara.getTracks().forEach((pista) => pista.stop());
    }

    flujoCamara = null;
    videoFoto.srcObject = null;
    camaraFotoInactiva.hidden = false;
    camaraFotoInactiva.textContent = fotoBase64
        ? "Fotografía capturada"
        : "Cámara inactiva";
    activarCamaraFoto.disabled = false;
    activarCamaraFoto.textContent = fotoBase64
        ? "Tomar otra fotografía"
        : "Activar cámara";
    tomarFoto.disabled = true;
}

function obtenerPunto(evento) {
    const rectangulo = lienzoFirma.getBoundingClientRect();
    const puntero = evento.touches ? evento.touches[0] : evento;

    return {
        x: (puntero.clientX - rectangulo.left) *
            (lienzoFirma.width / rectangulo.width),
        y: (puntero.clientY - rectangulo.top) *
            (lienzoFirma.height / rectangulo.height)
    };
}

function iniciarFirma(evento) {
    evento.preventDefault();
    firmando = true;
    firmaRealizada = true;

    const punto = obtenerPunto(evento);
    contextoFirma.beginPath();
    contextoFirma.moveTo(punto.x, punto.y);
}

function dibujarFirma(evento) {
    if (!firmando) {
        return;
    }

    evento.preventDefault();

    const punto = obtenerPunto(evento);
    contextoFirma.lineWidth = 3;
    contextoFirma.lineCap = "round";
    contextoFirma.strokeStyle = "#2a2e31";
    contextoFirma.lineTo(punto.x, punto.y);
    contextoFirma.stroke();
}

function terminarFirma() {
    firmando = false;
}

["mousedown", "touchstart"].forEach((evento) => {
    lienzoFirma.addEventListener(evento, iniciarFirma);
});

["mousemove", "touchmove"].forEach((evento) => {
    lienzoFirma.addEventListener(evento, dibujarFirma);
});

["mouseup", "mouseleave", "touchend"].forEach((evento) => {
    lienzoFirma.addEventListener(evento, terminarFirma);
});

document.getElementById("limpiarFirma").addEventListener("click", () => {
    contextoFirma.clearRect(
        0,
        0,
        lienzoFirma.width,
        lienzoFirma.height
    );

    firmaRealizada = false;
});

formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const camposObligatorios = [
        "nombre",
        "matricula",
        "correo",
        "carrera",
        "campus",
        "aula",
        "contactoEmergencia"
    ];

    const campoVacio = camposObligatorios.find((id) => {
        return !document.getElementById(id).value.trim();
    });

    if (campoVacio) {
        mostrarError("Todos los campos son obligatorios. Completa la información faltante.");
        document.getElementById(campoVacio).focus();
        return;
    }

    const correo = document.getElementById("correo");

    if (!correo.validity.valid) {
        mostrarError("Escribe un correo electrónico válido.");
        correo.focus();
        return;
    }

    if (!fotoBase64) {
        mostrarError("La fotografía es obligatoria.");
        return;
    }

    if (!firmaRealizada) {
        mostrarError("La firma es obligatoria.");
        return;
    }

    const datosFormulario = new FormData(formulario);
    const datos = Object.fromEntries(datosFormulario.entries());

    datos.foto = fotoBase64;
    datos.firma = lienzoFirma.toDataURL("image/png");
    datos.qr = `UNIVERPASS:${datos.matricula}`;

    UniverPass.guardar(datos);
    detenerCamaraFoto();

    window.location.href = "credencial.html";
});

function mostrarError(texto) {
    mensaje.textContent = texto;
    mensaje.className = "mensaje error advertencia";
}

window.addEventListener("beforeunload", detenerCamaraFoto);
