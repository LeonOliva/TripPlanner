require('dotenv').config(); // Carica variabili d'ambiente
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http'); // Importa modulo HTTP nativo
const { initSocket } = require('./socket'); // Importa la configurazione Socket

// --- IMPORTAZIONI FILE LOCALI ---
const passport = require('./config/passport'); 
const authRoutes = require('./routes/authRoutes'); 
const itinerariRoutes = require('./routes/itinerariRoutes'); 
const startCronJobs = require('./utils/cronJobs'); 

// --- INIZIALIZZAZIONE APP E SERVER ---
const app = express();
const httpServer = http.createServer(app); // Crea il server HTTP wrappando Express

// --- INIZIALIZZAZIONE SOCKET.IO ---
// Passiamo il server HTTP alla funzione initSocket
initSocket(httpServer); 

// --- MIDDLEWARE ---
app.use(cors({
    origin: 'http://localhost:5173', // URL del Frontend
    credentials: true // Permette cookie/sessioni
}));
app.use(express.json()); 
app.use(cookieParser()); 
app.use(passport.initialize());

// --- CONNESSIONE DATABASE ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
      console.log('MongoDB Connesso...');
      // Avvia i Cron Jobs solo se il DB è connesso
      startCronJobs(); 
  })
  .catch(err => console.error("Errore connessione MongoDB:", err));

// --- ROTTE API ---
app.use('/api/auth', authRoutes);
app.use('/api/itinerari', itinerariRoutes);
app.use(cors({
  origin: "*", // Per ora metti "*" (tutti), poi metteremo l'URL di Vercel per sicurezza
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// --- AVVIO SERVER ---
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`Server avviato su porta ${PORT} con Socket.IO attivo 🟢`);
});