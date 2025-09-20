const Itinerario = require("../models/itinerario");

// Crea itinerario
exports.creaItinerario = async (req, res) => {
   try {
        console.log("Richiesta ricevuta per salvare su MongoDB Atlas");
        console.log("Dati ricevuti:", req.body);

        const { titolo, descrizione, luoghi, travelMode, stato } = req.body;

        if (!titolo) {
            return res.status(400).json({
                success: false, 
                message: "Il titolo è obbligatorio"
            });
        }

        const nuovoItinerario = new Itinerario({
            titolo: titolo,
            descrizione: descrizione,
            luoghi: luoghi || [],
            travelMode: travelMode || 'DRIVING',
            stato: stato || 'bozza'
        });

        console.log("Tentativo salvataggio su MongoDB Atlas...");
        const itinerarioSalvato = await nuovoItinerario.save();
        console.log("Salvato con successo su MongoDB Atlas:", itinerarioSalvato._id);

        res.status(201).json({
            success: true,
            message: 'Itinerario salvato su MongoDB Atlas',
            data: itinerarioSalvato
        });
    } catch (error) {
        console.error("Errore MongoDB Atlas:", error);

        if (error.name === 'ValidationError') {
            const errori = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false, 
                message: "Errori di validazione MongoDB", 
                errors: errori
            });
        }

        res.status(500).json({
            success: false, 
            message: "Errore salvataggio MongoDB Atlas"
        });
    }
};

// Ottieni tutti gli itinerari
exports.tuttiItinerari = async (req, res) => {
    try {
        const itinerari = await Itinerario.find(); // CORRETTO: era "itinerari.find()"
        res.json({
            success: true,
            data: itinerari
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: "Errore nel recupero degli itinerari"
        });
    }
};

// Modifica itinerario
exports.modificaItinerario = async (req, res) => {
    try {
        const aggiornato = await Itinerario.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        
        if (!aggiornato) {
            return res.status(404).json({
                success: false,
                error: "Itinerario non trovato"
            });
        }
        
        res.json({
            success: true,
            message: "Itinerario aggiornato con successo",
            data: aggiornato
        });
    } catch (err) {
        console.error("Errore modifica:", err);
        res.status(500).json({
            success: false,
            error: "Errore nella modifica dell'itinerario"
        });
    }
};

// Cancella itinerario
exports.cancellaItinerario = async (req, res) => {
    try {
        const eliminato = await Itinerario.findByIdAndDelete(req.params.id);
        
        if (!eliminato) {
            return res.status(404).json({
                success: false,
                error: "Itinerario non trovato"
            });
        }
        
        res.json({
            success: true,
            message: "Itinerario cancellato correttamente",
            data: eliminato
        });
    } catch (err) {
        console.error("Errore cancellazione:", err);
        res.status(500).json({
            success: false,
            error: "Errore nella cancellazione dell'itinerario"
        });
    }
};