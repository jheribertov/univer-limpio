# UniverPass

Prototipo de frontend con dos recorridos:

1. **Crear credencial:** captura datos, fotografía y firma; muestra una credencial descargable.
2. **Kiosco:** lee el QR (cuando el navegador admite `BarcodeDetector`) o consulta por matrícula; después muestra los datos del aula.

## Archivos

- `index.html`: menú principal.
- `crear-credencial.html`: solicitud y captura de datos.
- `credencial.html`: credencial y descarga.
- `kiosco.html`: lector QR y consulta manual.
- `aula.html`: resultado de la consulta.
- `css/style.css`: diseño y colorimetría compartidos.
- `js/`: comportamiento de cada página.

## Cómo probarlo

1. Coloca tu archivo de logo con el nombre `UniverPass.png` en esta carpeta.
2. Abre la carpeta en Visual Studio Code.
3. Usa la extensión **Live Server** y abre `index.html`.
4. Primero crea una credencial. Después entra al Kiosco y pulsa “Usar la credencial guardada”.

Los datos se guardan en `localStorage`; todavía no existe una base de datos real. Para producción, el siguiente paso es crear una API/backend y sustituir las funciones de `localStorage` de `js/common.js`.
