const express = require('express');
const app = express();
const path = require('path');

const PORT = process.env.PORT || 3000;

// Servir archivos estáticos (index.html, etc.)
app.use(express.static(path.join(__dirname)));

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta de prueba
app.get('/test', (req, res) => {
  res.send('Servidor en Render funcionando correctamente');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
