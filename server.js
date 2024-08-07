// server.js
require('dotenv').config();
const express = require('express');
const admin = require('./firebaseAdmin');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const client = require('./mongoClient');

const app = express();
app.use(express.json());

app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.post('/secure-data', async (req, res) => {
  const idToken = req.headers.authorization.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Example MongoDB operation
    const db = client.db('yourDatabaseName');
    const collection = db.collection('yourCollectionName');
    const data = await collection.find({ userId: uid }).toArray();

    res.send(data);
  } catch (error) {
    res.status(401).send('Unauthorized');
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
