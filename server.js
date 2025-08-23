import express from "express";
import Stripe from "stripe";
import { google } from "googleapis";
import nodemailer from "nodemailer";

const app = express();
app.use(express.json());
app.use(express.static("public"));

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const sheets = google.sheets("v4");

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_CREDS),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"]
});

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const DOMAIN = process.env.DOMAIN;

// Configuración de email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Ruta para crear sesión de pago
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { nombre, correo, curso, precio } = req.body;

    // Guardar en Google Sheets
    const client = await auth.getClient();
    await sheets.spreadsheets.values.append({
      auth: client,
      spreadsheetId: SPREADSHEET_ID,
      range: "A:E",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[nombre, correo, curso, precio, new Date().toLocaleString()]]
      }
    });

    // Crear sesión de pago Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: curso },
            unit_amount: precio * 100
          },
          quantity: 1
        }
      ],
      mode: "payment",
      success_url: `${DOMAIN}/success.html`,
      cancel_url: `${DOMAIN}/cancel.html`
    });

    // Enviar correo de bienvenida
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: correo,
      subject: `¡Bienvenido a ${curso}!`,
      html: `<h1>Hola ${nombre}</h1>
             <p>Gracias por registrarte en ${curso}.</p>
             <p>Tu pago ha sido procesado exitosamente.</p>`
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al crear sesión de pago");
  }
});

// Bot de recordatorios (ejemplo diario)
setInterval(async () => {
  try {
    const client = await auth.getClient();
    const response = await sheets.spreadsheets.values.get({
      auth: client,
      spreadsheetId: SPREADSHEET_ID,
      range: "A:E"
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) return;

    // Recorre registros y envía recordatorios
    for (let i = 0; i < rows.length; i++) {
      const [nombre, correo, curso, precio, fecha] = rows[i];
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: correo,
        subject: `Recordatorio de tu curso ${curso}`,
        html: `<p>Hola ${nombre}, recuerda seguir aprovechando tu curso ${curso}. ¡Sigue aprendiendo!</p>`
      });
    }
  } catch (err) {
    console.error("Error en bot de recordatorios:", err);
  }
}, 24 * 60 * 60 * 1000); // 24 horas

app.listen(3000, () => console.log("Servidor corriendo en puerto 3000"));
