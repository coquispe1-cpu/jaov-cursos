const express = require('express');
const app = express();
const path = require('path');

const PORT = process.env.PORT || 3000;

// Muestra tu index.html
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta de prueba
app.get('/test', (req, res) => {
  res.send('Servidor en Render funcionando correctamente');
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
