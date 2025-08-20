const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser');

const itinerariRouter = require('./routes/itinerari')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname)))

app.get('/', (req,res)=>{
    res.sendFile('index.html',{root:__dirname})
})

app.listen(3000, (req,res)=>{
    console.log("server in ascolto sulla porta 3000")
})

app.post('/registrazione',(req,res)=>{
    const {username, email, password, conferma_password} = req.body;
    console.log(`Nuova registrazione effettuata: ${username},${email},${password}`)
    res.status(200).json({message:"registrazione avvenuta correttamente", data:req.body})
})