require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());


//Auth-Routen 
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

//start server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server läuft auf Port ${PORT}`);
    });
  } catch (error) {
    console.error('Fehler beim Starten des Servers:', error);
  }
}
startServer();