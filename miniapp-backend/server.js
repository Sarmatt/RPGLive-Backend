require('dotenv').config();
const express = require('express');
const sendBugReportEmail = require('./services/mailer');
const path = require('path');

const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ВАЖЛИВО: тепер правильно підключаємо public/
app.use(express.static(path.join(__dirname, 'public')));

const cors = require('cors');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="uk">
    <head>
      <meta charset="UTF-8">
      <title>Unity MiniApp</title>
    </head>
    <body>
      <h1>Unity Telegram MiniApp</h1>
      <p>Сервер працює! 🚀</p>
    </body>
    </html>
  `);
});

app.post('/bug-report', async (req, res) => {
  const { title, description } = req.body;
  try {
    await sendBugReportEmail(`Звіт про помилку: ${title}`, description);
    res.status(200).send('Bug report відправлено!');
  } catch (error) {
    console.error('Помилка відправки email:', error);
    res.status(500).send('Не вдалося відправити звіт');
  }
});

// --------- Stripe Checkout ---------
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { amount } = req.body; // отримуємо суму від Unity
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Некоректна сума' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Unity Game Purchase' },
            unit_amount: amount, // сума в центах
          },
          quantity: 1,
        },
      ],
      success_url: `${BASE_URL}/success.html`,
      cancel_url: `${BASE_URL}/cancel.html`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${BASE_URL}`));
