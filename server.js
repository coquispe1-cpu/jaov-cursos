// servidor.js
const express = require('express');
const app = express();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { google } = require('googleapis');
const bodyParser = require('body-parser');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // tu carpeta con HTML, CSS y JS

// Configuración de Google Sheets usando la variable de entorno GOOGLE_CREDS
const creds = JSON.parse(process.env.GOOGLE_CREDS);
const auth = new google.auth.GoogleAuth({
  credentials: creds,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});
const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

// Endpoint para crear sesión de pago
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
        values: [[nombre, correo, curso, precio, new Date().toLocaleString()]]
      }
    });

    // Crear sesión de pago en Stripe
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
    res.status(500).send('Error creando la sesión de pago');
  }
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
