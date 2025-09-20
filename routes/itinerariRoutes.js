const express = require('express');
const router = express.Router();
const itinerariController = require('../controllers/itinerariController');

//crea itinerario
router.post("/crea",itinerariController.creaItinerario);

//visualizza tutti gli itinerario
router.get("/visualizza", itinerariController.tuttiItinerari);

//modifica itinerario
router.post("/modifica", itinerariController.modificaItinerario);

//cancella itinerario
router.post("/cancella", itinerariController.cancellaItinerario);

module.exports=router;