const express = require('express');
const router = express.Router();
const itinerariController = require('../controllers/itinerariController');
const { verifyAccessToken } = require('../middlewares/authMiddleware');

console.log("Controller caricato:", itinerariController);

// ==========================================
//  ROTTE PROTETTE (Richiedono Login)
// ==========================================

// 1. Gestione CRUD Itinerari
router.post("/crea", verifyAccessToken, itinerariController.creaItinerario);
router.get("/miei", verifyAccessToken, itinerariController.getMieiItinerari); // I miei viaggi (creati + partecipati)
router.put("/modifica/:id", verifyAccessToken, itinerariController.modificaItinerario);
router.delete("/cancella/:id", verifyAccessToken, itinerariController.cancellaItinerario);

// 2. Funzionalità Social (Partecipazione)
router.post("/partecipa/:id", verifyAccessToken, itinerariController.richiediPartecipazione);
router.post("/accetta", verifyAccessToken, itinerariController.accettaPartecipante);
router.post("/rifiuta", verifyAccessToken, itinerariController.rifiutaPartecipante);
router.post("/abbandona/:id", verifyAccessToken, itinerariController.abbandonaViaggio);
router.get("/notifiche", verifyAccessToken, itinerariController.getNotifiche);
router.delete("/notifiche/:id", verifyAccessToken, itinerariController.cancellaNotifica);
router.put("/notifiche/:id/leggi", verifyAccessToken, itinerariController.segnaNotificaLetta);
router.post("/rimuovi-partecipante", verifyAccessToken, itinerariController.rimuoviPartecipante);
router.post("/accetta-invito", verifyAccessToken, itinerariController.accettaInvito);
router.put("/notifiche/leggi-tutte", verifyAccessToken, itinerariController.segnaTutteLette);

// ==========================================
//  ROTTE PUBBLICHE (Visibili a tutti)
// ==========================================

// Ricerca e Liste
router.get("/visualizza", itinerariController.visualizzaItinerari); // Tutti i pubblici
router.get("/ricerca", itinerariController.ricercaItinerari);

// Dettaglio Singolo Viaggio
router.get("/visualizza/:id", itinerariController.visualizzaItinerario);

module.exports = router;