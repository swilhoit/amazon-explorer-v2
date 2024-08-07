// Assuming you have a 'users' collection in your MongoDB
const { MongoClient } = require('mongodb');

async function updateUserSubscription(userId, plan) {
  const client = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    const database = client.db('your-database-name');
    const users = database.collection('users');

    // Update the user's subscription plan
    await users.updateOne(
      { _id: userId },
      { $set: { subscriptionPlan: plan } }
    );

    console.log('User subscription updated');
  } finally {
    await client.close();
  }
}
