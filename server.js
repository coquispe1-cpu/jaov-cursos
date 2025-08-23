import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import Stripe from "stripe";
import { google } from "googleapis";
import nodemailer from "nodemailer";

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Google Sheets
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_CREDS),
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});
const sheets = google.sheets({ version: 'v4', auth });

// Rutas
app.get("/", (req, res) => res.sendFile('index.html', { root: './public' }));

app.post("/pago", async (req, res) => {
  const { nombre, correo, curso, precio } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: precio * 100,
      currency: 'usd',
      receipt_email: correo
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Registros!A:D',
      valueInputOption: 'USER_ENTERED',
      resource: { values: [[nombre, correo, curso, precio, new Date().toLocaleString()]] }
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'TU_CORREO@gmail.com',
        pass: 'TU_CONTRASEÑA_APP'
      }
    });

    await transporter.sendMail({
      from: '"JAOV Cursos" <TU_CORREO@gmail.com>',
      to: correo,
      subject: 'Inscripción confirmada',
      text: `Hola ${nombre}, te has inscrito correctamente al curso ${curso}.`
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error en el pago");
  }
});

app.listen(port, () => console.log(`Servidor corriendo en puerto ${port}`));
