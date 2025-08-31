const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser'); //per acquisire i dati dal form
require('dotenv').config(); //per usare process.env
console.log("MONGO_URI:", process.env.MONGO_URI);
const mongoose = require('mongoose');

const itinerariRouter = require('./routes/itinerariRoutes');
const authRouter = require('./routes/authRoutes');
//const { use } = require('react');

//Routes API
app.use('/api/itinerari', itinerariRouter);
app.use('/api/auth', authRouter);

app.use(bodyParser.urlencoded({ extended: true })); //sempre per acquisire i dati dal form
app.use(express.static(path.join(__dirname))); //serve per dire al server Node quali file statici (HTML, CSS, Javascript lato client) possono servire direttamente al 
//browser, senza dover scrivere una rotta per ognuno. 
//express.static è un middleware che dice guarda dentro __dirname (la cartella dove ho il mio server.js) e se esiste un file richiesto dal browser restituiscilo così com'è
//path.join serve per costruire il percorso assoluto della cartella in cui si trovano quei file, così da funzionare in tutti i sistemi operativi

//Route per l'homepage
app.get('/', (req,res)=>{
    res.sendFile('index.html',{root:__dirname});
})

app.listen(3000, (req,res)=>{
    console.log("server in ascolto sulla porta 3000");
})
/*
app.post('/registrazione',(req,res)=>{
    const {username, email, password, conferma_password} = req.body;
    console.log(`Nuova registrazione effettuata: ${username},${email},${password}`)
    res.status(200).json({message:"registrazione avvenuta correttamente", data:req.body})
})
*/

//connessione a MongoAtlas

mongoose.connect(process.env.MONGO_URI,{//process.env a "scartare" il file mongoURI dove ho ci sono Username e Password, per non scriverli in chiaro nel codice
    useNewUrlParser:true,
    useUnifiedTopology: true,
})
.then(() => console.log("Connesso a MongoDB atlas"))
.catch(err => console.error("Errore:",err));