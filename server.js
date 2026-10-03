const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// 1. Middlewares de seguridad y parseo
app.use(cors());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// URL de tu Google Apps Script vinculada a Google Sheets
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbwxlzV1h8v15v230s3Q158o4c3aZ0a82K98o/exec";

// Ruta de prueba GET
app.get('/', (req, res) => {
    res.send("Servidor UNIVER con Google Sheets funcionando");
});

// 2. Ruta de validación conectada a Google Sheets (DEBE IR ANTES DE LOS ESTÁTICOS)
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

// 3. Archivos estáticos al final para que no intercepten las rutas de la API
app.use(express.static(__dirname));

// Puerto dinámico para Railway
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});