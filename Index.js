const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();
const mongoose = require('mongoose');

const itinerariRouter = require('./routes/itinerari');
const authRouter = require('./routes/authRoutes');

//Routes API
app.use('/api/itinerari', itinerariRouter);
app.use('/api/auth', authRouter);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

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

mongoose.connect(process.env.mongoUri)//process.env a "scartare" il file mongoURI dove ho ci sono Username e Password, per non scriverli in chiaro nel codice
.then(() => console.log("Connesso a MongoDB atlas"))
.catch(err => console.error("Errore:",err));