const { MongoClient, ServerApiVersion } = require('mongodb');
const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI || "mongodb+srv://klarakirbis:LbQtY0gZ9hLXHz46%40cluster0.grtrylt.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connectDB() {
  try {
    // Connect the client to the server
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // Extract the native MongoDB connection and pass it to Mongoose
    const db = client.db(); // Use the default database or specify one (e.g., "recommendations")
    mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Store the client and mongoose connection for reuse or closure
    global.mongoClient = client;
    global.mongooseConnection = mongoose.connection;

    // Log Mongoose connection status
    mongoose.connection.on('error', (err) => console.error('Mongoose connection error:', err));
    mongoose.connection.once('open', () => console.log('Mongoose connected to MongoDB'));

  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

module.exports = connectDB;

// Graceful shutdown (optional)
process.on('SIGINT', async () => {
  await client.close();
  await mongoose.connection.close();
  console.log('MongoDB and Mongoose connections closed');
  process.exit(0);
});