require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const http = require('http');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());


//Auth-Routen 
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

// Leaderboard-Routen
const leaderboardRoutes = require('./routes/leaderboard.routes');
app.use('/api/leaderboard', leaderboardRoutes);

// Socket.io integrieren
const setupSocket = require('./sockets/socket');
setupSocket(server); // ⬅ Socket wird hier gestartet

//start server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Server läuft auf Port ${PORT}`);
    });
  } catch (error) {
    console.error('Fehler beim Starten des Servers:', error);
  }
}
startServer();