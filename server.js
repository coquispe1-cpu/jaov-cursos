// servidor.js
const express = require('express');
const app = express();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // clave de Stripe desde variable de entorno
const { google } = require('googleapis');

// Para leer las variables de entorno y servir archivos estáticos
app.use(express.json());
app.use(express.static('public'));

// Configuración de Google Sheets usando variable de entorno GOOGLE_CREDS
const sheets = google.sheets('v4');
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_CREDS), // JSON de la cuenta de servicio
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID; // ID de tu hoja de cálculo

// Endpoint para crear sesión de pago con Stripe
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { nombre, correo, curso, precio } = req.body;

    // Guardar datos en Google Sheets
    const client = await auth.getClient();
    await sheets.spreadsheets.values.append({
      auth: client,
      spreadsheetId: SPREADSHEET_ID,
      range: 'A:E',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [
          [nombre, correo, curso, precio, new Date().toLocaleString()]
        ]
      }
    });

    // Crear sesión de pago
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: curso },
            unit_amount: precio * 100
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${process.env.DOMAIN}/exito.html`,
      cancel_url: `${process.env.DOMAIN}/cancelar.html`
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al crear la sesión de pago');
  }
});

// Iniciar servidor en puerto 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
