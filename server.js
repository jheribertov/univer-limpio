cconst express = require('express');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors()); // <--- ¡Agrégalo aquí para habilitar las peticiones externas!
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.static('.')); 
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));
// URL de tu Web App de Google Apps Script vinculada a tu Google Sheet
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbysrV8NHeG6ltJh_E8Tt3VaJHVJ8uXBt95Qba-K_knY5Io7WHFNDtbDOaH7WbZ_GyWp1A/exec";

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('Servidor UNIVER con Google Sheets funcionando');
});

// Ruta de Validación conectada a Google Sheets
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
            body: JSON.stringify({ matricula: codigo })
        });

        const resultado = await respuestaGoogle.json();

        if (!resultado.encontrado) {
            return res.json({ valido: false, mensaje: "Credencial no encontrada" });
        }

        const alumno = resultado.data;

        if (String(alumno.estado).toLowerCase() === 'inactivo' || String(alumno.estado).toLowerCase() === 'inactiva') {
            return res.json({ valido: false, mensaje: "Esta credencial está inactiva" });
        }

        res.json({
            valido: true,
            nombre: `${alumno.nombre} ${alumno.apellido}`,
            matricula: alumno.matricula,
            carrera: alumno.carrera,
            campus: alumno.campus,
            aula: alumno.aula,
            foto: alumno.fotografia
        });

    } catch (error) {
        console.error("Error al validar con Google Sheets:", error);
        res.status(500).json({ valido: false, mensaje: "Error interno en el servidor" });
    }
});

app.listen(puerto, () => {
    console.log(`🚀 Servidor activo en puerto ${puerto}`);
});