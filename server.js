const express = require('express');
const app = express();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { google } = require('googleapis');

// Servir archivos estáticos
app.use(express.static('public'));
app.use(express.json());

// Configuración de Google Sheets
const sheets = google.sheets('v4');
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_CREDS),
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

// Ruta para crear sesión de pago con Stripe y guardar en Google Sheets
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { nombre, correo, curso, precio } = req.body;

    // Guardar en Google Sheets
    const client = await auth.getClient();
    await sheets.spreadsheets.values.append({
      auth: client,
      spreadsheetId: SPREADSHEET_ID,
      range: 'A:E',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[nombre, correo, curso, precio, new Date().toLocaleString()]]
      }
    });

    // Crear sesión de Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: curso },
          unit_amount: precio * 100
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${process.env.DOMAIN}/success.html`,
      cancel_url: `${process.env.DOMAIN}/cancel.html`
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error en la creación de la sesión de pago');
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
