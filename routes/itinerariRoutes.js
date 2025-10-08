const express = require('express');
const router = express.Router();
const itinerariController = require('../controllers/itinerariController');

//crea itinerario
router.post("/crea",itinerariController.creaItinerario);

//visualizza tutti gli itinerari
router.get("/visualizza", itinerariController.visualizzaItinerari);

//visualizza tutti gli itinerari
router.get("/visualizza/:id", itinerariController.visualizzaItinerario);

//modifica itinerario
router.put("/modifica/:id", itinerariController.modificaItinerario);

//ricerca itinerari
router.get("/ricerca", itinerariController.ricercaItinerari);

//cancella itinerario
router.delete("/cancella/:id", itinerariController.cancellaItinerario);

module.exports=router;