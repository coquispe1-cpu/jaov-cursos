
 // server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Cargar variables de entorno desde .env si existen
dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Para obtener la ruta correcta de la carpeta actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ejemplo de ruta para éxito.html
app.get('/exito', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'éxito.html'));
});

// Ejemplo de ruta para cancelar.html
app.get('/cancelar', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cancelar.html'));
});

// Escuchar puerto
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
