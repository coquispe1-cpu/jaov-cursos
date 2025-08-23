import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Servir archivos estáticos (CSS, JS, imágenes)
app.use(express.static(path.join(__dirname)));

// Ruta raíz: index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Rutas de éxito y cancelación
app.get('/exito', (req, res) => {
  res.sendFile(path.join(__dirname, 'éxito.html'));
});

app.get('/cancelar', (req, res) => {
  res.sendFile(path.join(__dirname, 'cancelar.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
