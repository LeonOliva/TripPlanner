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

// Visualizza tutti gli itinerari
exports.visualizzaItinerari = async (req, res) => {
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

// Visualizza un singolo itinearario
exports.visualizzaItinerario = async (req, res) => {
    try{
        const id = req.params.id;
        const itinerario = await Itinerario.findById(id);
        if(!itinerario) return res.status(404).json({message:"Itinerario non trovato"});
        res.json({
            success: true, 
            data: itinerario});
    }catch (err){
        console.error(err);
        res.status(500).json({message:"Errore server"});
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
        console.error("Errore aggiornamento:", err);
        res.status(500).json({
            success: false,
            error: "Errore nell'aggiornamento dell'itinerario"
        });
    }
};

// Ricerca itinerari
exports.ricercaItinerari = async (req, res) => {
    try {
        const { search, stato, travelMode } = req.query;
        
        let filtri = {};
        
        if (search && search.trim() !== '') {
            const searchTerm = search.trim();
            filtri.$or = [
                { titolo: { $regex: searchTerm, $options: 'i' } },
                { descrizione: { $regex: searchTerm, $options: 'i' } },
                { luoghi: { $in: [new RegExp(searchTerm, 'i')] } }
            ];
        }
        
        if (stato) filtri.stato = stato;
        if (travelMode) filtri.travelMode = travelMode;
        
        const itinerari = await Itinerario.find(filtri).sort({ createdAt: -1 });
        
        res.json({
            success: true,
            data: itinerari
        });
    } catch (error) {
        console.error('Errore ricerca:', error);
        res.status(500).json({
            success: false,
            message: 'Errore nella ricerca'
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