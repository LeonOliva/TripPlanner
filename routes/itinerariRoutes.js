const express = require('express')
const router = express.Router()
const {itineari} = require('../models/itinerario')

router.get('/', (req, res) => { //visualizza tutti gli itinerari
    res.status(200).json({success:true, data:itenerari})
})

router.get('/:id',(req,res)=>{ //per visualizzare un itenerario specifico
})


router.post('/', (req,res) => { //per inserire un nuovo itenerario
    itinerari.push(itinerario)
    res.status(200).json({success:true, data: itinerari})
})

router.put('/:id', (req,res) => { //modifica itinerario
   
})

router.delete('/:id', (req,res) => { //cancella itinearario
    const {id} = req.params
    const index = itinerari.findIndex(itinerario => itinerario.id === id)
    itinerari.splice(index,1)
    res.status(200).json({success:true, data:itinerari})
})

module.exports=router;

