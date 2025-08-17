const { initializeApp } = require("firebase/app");
require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.EXPRESS_APP_API_KEY,
  authDomain: process.env.EXPRESS_APP_AUTH_DOMAIN,
  projectId: process.env.EXPRESS_APP_PROJECT_ID,
  storageBucket: process.env.EXPRESS_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPRESS_APP_MESSAGING_SENDER_ID,
  appId: process.env.EXPRESS_APP_APP_ID
};

const app = initializeApp(firebaseConfig);

module.exports = { app };