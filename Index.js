require('dotenv').config(); //per usare process.env
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser'); //per acquisire i dati dal form
const mongoose = require('mongoose');
const http = require ('http');
const cors = require ('cors'); //per abilitare richiesta Cross-Origin
const cookieParser = require('cookie-parser');

//Node HTTP come callback per gestire le richieste
// const server = http.createServer(app);

/*Definiamo i middleware nell'ordine in cui vogliamo eseguirli
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true //Necessario per inviare/ricevere cookie cross-origin
}))*/

const app = express(); //creazione dell'app con il framework express
//express ritorna un app che è una Function di JavaScript, che deve essere passata ad un server

const itinerariRouter = require('./routes/itinerariRoutes');
const authRouter = require('./routes/authRoutes');
//const { use } = require('react');


app.use(express.json());
app.use(express.urlencoded({ extended: true })); //sempre per acquisire i dati dal form
app.use(cookieParser());
app.use(express.static(path.join(__dirname))); //serve per dire al server Node quali file statici (HTML, CSS, Javascript lato client) possono servire direttamente al 
//browser, senza dover scrivere una rotta per ognuno. 
//express.static è un middleware che dice guarda dentro __dirname (la cartella dove ho il mio server.js) e se esiste un file richiesto dal browser restituiscilo così com'è
//path.join serve per costruire il percorso assoluto della cartella in cui si trovano quei file, così da funzionare in tutti i sistemi operativi

//Routes API
app.use('/api/itinerari', itinerariRouter);
app.use('/api/auth', authRouter);

//Route per l'homepage
app.get('/', (req,res)=>{
    res.sendFile('index.html',{root:__dirname});
})

/*app.get('/registrazione', (req,res)=>{
    res.sendFile('register.html',({root:__dirname}));
})*/

app.listen(3000, (req,res)=>{
    console.log("server in ascolto sulla porta 3000");
})

//Connessione a MongoAtlas
mongoose.connect(process.env.MONGO_URI,{//process.env a "scartare" il file mongoURI dove ho ci sono Username e Password, per non scriverli in chiaro nel codice
    //Parametri non più necessari in questa versione di node
    //useNewUrlParser:true,    
    //useUnifiedTopology: true,
})
.then(() => console.log("Connesso a MongoDB atlas"))
.catch(err => console.error("Errore:",err));