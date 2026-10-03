const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const app = express();

// 1. Middlewares de seguridad y parseo
app.use(cors());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// URL de tu Google Apps Script vinculada a Google Sheets
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbwILqWNvPReTPU_qDDvDkH_QOivrMnI0koCYAsn498DTUhS4Zr3uswcjIp1t2xaR41Bog/exec";

// 2. Servir el frontend automáticamente al entrar a la raíz del sitio
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // Cambia 'index.html' si tu archivo principal tiene otro nombre
});

// 3. Ruta de validación conectada a Google Sheets (DEBE IR ANTES DE LOS ESTÁTICOS)
app.post('/api/validar', async (req, res) => {
    try {
        const { codigo } = req.body;
        if (!codigo) {
            return res.status(400).json({ valido: false, mensaje: "No se recibió código" });
        }

        // Consultamos a Google Sheets mediante la Web App
        const respuestaGoogle = await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ codigo })
        });

        const resultado = await respuestaGoogle.json();

        if (!resultado.encontrado) {
            return res.json({ valido: false, mensaje: "Credencial no encontrada" });
        }

        const alumno = resultado.datos;

        if (String(alumno.estado).toLowerCase() === "inactivo") {
            return res.json({ valido: false, mensaje: "Esta credencial está inactiva" });
        }

        res.json({
            valido: true,
            nombre: `${alumno.nombre} ${alumno.apellidos}`,
            matricula: alumno.matricula,
            carrera: alumno.carrera,
            campus: alumno.campus,
            foto: alumno.fotografia
        });

    } catch (error) {
        console.error("Error al validar con Google Sheets:", error);
        res.status(500).json({ valido: false, mensaje: "Error interno en el servidor" });
    }
});

// 4. Archivos estáticos de apoyo (CSS, imágenes, scripts secundarios)
app.use(express.static(__dirname));

// Puerto dinámico para Railway
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});