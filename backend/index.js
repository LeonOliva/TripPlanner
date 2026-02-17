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
    // Autorizza sia il tuo frontend su Vercel che localhost per i test
    origin: [
        'https://trip-planner-krh45msup-pierluigis-projects-d8d8528c.vercel.app', 
        'http://localhost:5173'
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true // Fondamentale per i cookie e il Refresh Token
}));
app.use(express.json()); 
app.use(cookieParser()); 
app.use(passport.initialize());



const connectionString = "mongodb+srv://pierluigi_admin:PasswordFacile2026@cluster0.yeeopd4.mongodb.net/TripPlanner?retryWrites=true&w=majority";

// Opzione A: Se vuoi debuggare, stampa cosa legge Render (cancellalo dopo!)
console.log("Tentativo connessione con URI:", connectionString.replace(/:([^:@]{1,})@/, ':****@')); 
console.log("Tentativo connessione DIRETTA..."); // Togliamo il replace per essere sicuri

mongoose.connect(connectionString)
  .then(() => {
      console.log('MongoDB Connesso... 🟢');
      startCronJobs(); 
  })
  .catch(err => console.error("❌ ERRORE CRITICO MONGO:", err.message));

// --- ROTTE API ---
app.use('/api/auth', authRoutes);
app.use('/api/itinerari', itinerariRoutes);

// --- AVVIO SERVER ---
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`Server avviato su porta ${PORT} con Socket.IO attivo 🟢`);
});