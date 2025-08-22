const express = require('express');
const app = express();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { google } = require('googleapis');

app.use(express.json());
app.use(express.static('public'));

const sheets = google.sheets('v4');

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_CREDS),
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

app.post('/create-checkout-session', async (req, res) => {
  const { nombre, correo, curso, precio } = req.body;
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
    success_url: `${process.env.DOMAIN}/exito.html`,
    cancel_url: `${process.env.DOMAIN}/cancelar.html`
  });

  res.json({ url: session.url });
});

app.listen(process.env.PORT || 3000, () => console.log('Servidor corriendo'));
