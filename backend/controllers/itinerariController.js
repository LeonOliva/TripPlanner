const Itinerario = require("../models/itinerario");
const Notifica = require("../models/Notifica"); 
const User = require("../models/User"); 
const { sendNotification } = require('../socket');

// 1. CREA ITINERARIO
exports.creaItinerario = async (req, res) => {
    try {
        console.log("--- INIZIO CREAZIONE VIAGGIO ---");
        
        const { 
            origin, destination, stops, startDate, endDate, 
            travelType, participants, image, visibility, sharedWith 
        } = req.body;

        if (!origin || !destination || !startDate || !endDate) {
            return res.status(400).json({ success: false, message: "Campi obbligatori mancanti." });
        }

        const nuovoItinerario = new Itinerario({
            titolo: `Viaggio a ${destination}`,
            autore: req.user.id,
            origine: origin,
            destinazione: destination,
            tappe: stops || [],
            dataInizio: startDate,
            dataFine: endDate,
            partecipanti: participants || 2,
            immagine: image,
            travelMode: travelType ? travelType.toUpperCase() : 'FLIGHT',
            visibilita: visibility || 'pubblica',
            condivisoCon: sharedWith || [],
            stato: 'bozza',
            luoghi: [origin, ... (stops || []), destination]
        });

        const salvato = await nuovoItinerario.save();

        // INVITI PRIVATI
        if (visibility === 'privata' && sharedWith && sharedWith.length > 0) {
            const utentiInvitati = await User.find({ email: { $in: sharedWith } });

            for (const utente of utentiInvitati) {
                if (utente._id.toString() !== req.user.id) {
                    const notifica = await Notifica.create({
                        destinatario: utente._id,
                        mittente: req.user.id,
                        tipo: 'invito_viaggio',
                        itinerario: salvato._id,
                        messaggio: `Ti ha invitato a partecipare al viaggio privato: ${destination}`
                    });
                    
                    // Notifica Socket
                    await notifica.populate('mittente', 'username');
                    await notifica.populate('itinerario', 'titolo');
                    sendNotification(utente._id, notifica);
                }
            }
        }
        
        res.status(201).json({ success: true, message: 'Viaggio creato!', data: salvato });

    } catch (error) {
        console.error("❌ ERRORE CREAZIONE:", error);
        res.status(500).json({ success: false, message: "Errore server", error: error.message });
    }
};

// 2. I MIEI ITINERARI
exports.getMieiItinerari = async (req, res) => {
    try {
        const itinerari = await Itinerario.find({
            $or: [
                { autore: req.user.id },
                { partecipantiAttuali: req.user.id }
            ]
        })
        .sort({ createdAt: -1 })
        .populate('autore', 'username');
        
        res.json({ success: true, data: itinerari });
    } catch (err) {
        console.error("❌ ERRORE RECUPERO:", err);
        res.status(500).json({ success: false, error: "Errore server" });
    }
};

// 3. VISUALIZZA TUTTI (PUBBLICI - FILTRA SCADUTI)
exports.visualizzaItinerari = async (req, res) => {
    try {
        const adesso = new Date();
        // Imposta l'ora a 00:00 per includere i viaggi di oggi
        adesso.setHours(0, 0, 0, 0);

        // Mostra solo i viaggi pubblici la cui data di inizio è futura o uguale a oggi
        const itinerari = await Itinerario.find({ 
            visibilita: 'pubblica',
            dataInizio: { $gte: adesso } // $gte = Greater Than or Equal (Maggiore o uguale)
        })
        .populate('autore', 'username')
        .sort({ createdAt: -1 });

        res.json({ success: true, data: itinerari });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// 4. VISUALIZZA SINGOLO
exports.visualizzaItinerario = async (req, res) => {
    try {
        const itinerario = await Itinerario.findById(req.params.id)
            .populate('autore', 'username email') 
            .populate('partecipantiAttuali', 'username email')
            .populate('richiestePendenti', 'username email');

        if (!itinerario) return res.status(404).json({ success: false, message: "Itinerario non trovato" });

        res.json({ success: true, data: itinerario });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// 5. MODIFICA ITINERARIO
exports.modificaItinerario = async (req, res) => {
    try {
        const { 
            origin, destination, stops, startDate, endDate, 
            travelType, participants, image, visibility, sharedWith 
        } = req.body;

        const datiDaAggiornare = {
            titolo: `Viaggio a ${destination || 'Destinazione'}`,
            origine: origin,
            destinazione: destination,
            tappe: stops,
            dataInizio: startDate,
            dataFine: endDate,
            partecipantiMax: participants,
            immagine: image,
            travelMode: travelType ? travelType.toUpperCase() : 'FLIGHT',
            visibilita: visibility,
            condivisoCon: sharedWith
        };

        Object.keys(datiDaAggiornare).forEach(key => 
            datiDaAggiornare[key] === undefined && delete datiDaAggiornare[key]
        );

        const aggiornato = await Itinerario.findByIdAndUpdate(
            req.params.id, 
            datiDaAggiornare, 
            { new: true }
        );

        if (!aggiornato) return res.status(404).json({ success: false, error: "Non trovato" });

        // Notifiche su modifica (inviti)
        if (visibility === 'privata' && sharedWith && sharedWith.length > 0) {
            const utentiInvitati = await User.find({ email: { $in: sharedWith } });

            for (const utente of utentiInvitati) {
                if (utente._id.toString() !== req.user.id && !aggiornato.partecipantiAttuali.includes(utente._id)) {
                    const notificaEsistente = await Notifica.findOne({
                        destinatario: utente._id,
                        tipo: 'invito_viaggio',
                        itinerario: aggiornato._id
                    });

                    if (!notificaEsistente) {
                        const notifica = await Notifica.create({
                            destinatario: utente._id,
                            mittente: req.user.id,
                            tipo: 'invito_viaggio',
                            itinerario: aggiornato._id,
                            messaggio: `Ti ha invitato a partecipare al viaggio privato: ${aggiornato.destinazione}`
                        });
                        
                        await notifica.populate('mittente', 'username');
                        await notifica.populate('itinerario', 'titolo');
                        sendNotification(utente._id, notifica);
                    }
                }
            }
        }
        
        res.json({ success: true, message: "Viaggio aggiornato", data: aggiornato });

    } catch (err) {
        console.error("Errore modifica:", err);
        res.status(500).json({ success: false, error: "Errore aggiornamento" });
    }
};

// 6. CANCELLA ITINERARIO
exports.cancellaItinerario = async (req, res) => {
    try {
        const eliminato = await Itinerario.findOneAndDelete({ _id: req.params.id, autore: req.user.id });
        if (!eliminato) return res.status(404).json({ success: false, error: "Non trovato o non sei l'autore" });
        res.json({ success: true, message: "Viaggio cancellato" });
    } catch (err) {
        res.status(500).json({ success: false, error: "Errore durante la cancellazione" });
    }
};

// 7. RICERCA
exports.ricercaItinerari = async (req, res) => {
    try {
        const { search } = req.query;
        let filtri = {};
        
        // Filtra anche qui per data futura
        const adesso = new Date();
        adesso.setHours(0, 0, 0, 0);
        filtri.dataInizio = { $gte: adesso };

        if (search) {
             filtri.$or = [
                { titolo: { $regex: search, $options: 'i' } },
                { destinazione: { $regex: search, $options: 'i' } }
            ];
        }
        const itinerari = await Itinerario.find(filtri);
        res.json({ success: true, data: itinerari });
    } catch (error) {
        res.status(500).json({ success: false, message: "Errore ricerca" });
    }
};

// --- LOGICA PARTECIPAZIONE ---

// 8. RICHIEDI PARTECIPAZIONE
exports.richiediPartecipazione = async (req, res) => {
    try {
        const viaggioId = req.params.id;
        const userId = req.user.id;

        const viaggio = await Itinerario.findById(viaggioId);
        if (!viaggio) return res.status(404).json({ message: "Viaggio non trovato" });

        if (viaggio.autore && viaggio.autore.toString() === userId) {
            return res.status(400).json({ message: "Sei l'autore!" });
        }
        if (viaggio.partecipantiAttuali.includes(userId)) return res.status(400).json({ message: "Sei già partecipante" });
        if (viaggio.richiestePendenti.includes(userId)) return res.status(400).json({ message: "Richiesta già inviata" });
        
        if (viaggio.partecipantiAttuali.length >= viaggio.partecipantiMax) {
            return res.status(400).json({ message: "Posti esauriti" });
        }

        viaggio.richiestePendenti.push(userId);
        await viaggio.save();

        const notifica = await Notifica.create({
            destinatario: viaggio.autore,
            mittente: userId,
            tipo: 'richiesta_partecipazione',
            itinerario: viaggio._id,
            messaggio: `Qualcuno vuole unirsi al tuo viaggio per ${viaggio.destinazione}`
        });

        await notifica.populate('mittente', 'username');
        await notifica.populate('itinerario', 'titolo');
        sendNotification(viaggio.autore, notifica);

        res.json({ success: true, message: "Richiesta inviata" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 9. ACCETTA PARTECIPANTE
exports.accettaPartecipante = async (req, res) => {
    try {
        const { viaggioId, utenteDaAccettareId, notificaId } = req.body; 
        
        const viaggio = await Itinerario.findById(viaggioId);
        if (viaggio.autore.toString() !== req.user.id) return res.status(403).json({ message: "Non autorizzato" });

        viaggio.richiestePendenti = viaggio.richiestePendenti.filter(id => id.toString() !== utenteDaAccettareId);
        viaggio.partecipantiAttuali.push(utenteDaAccettareId);
        await viaggio.save();

        if (notificaId) await Notifica.findByIdAndDelete(notificaId);

        const notifica = await Notifica.create({
            destinatario: utenteDaAccettareId,
            mittente: req.user.id,
            tipo: 'richiesta_accettata',
            itinerario: viaggio._id,
            messaggio: `Sei stato accettato nel viaggio per ${viaggio.destinazione}!`
        });

        await notifica.populate('mittente', 'username');
        await notifica.populate('itinerario', 'titolo');
        sendNotification(utenteDaAccettareId, notifica);

        res.json({ success: true, message: "Utente accettato" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 10. ABBANDONA VIAGGIO
exports.abbandonaViaggio = async (req, res) => {
    try {
        const viaggioId = req.params.id;
        const userId = req.user.id;

        const viaggio = await Itinerario.findById(viaggioId);
        viaggio.partecipantiAttuali = viaggio.partecipantiAttuali.filter(id => id.toString() !== userId);
        viaggio.richiestePendenti = viaggio.richiestePendenti.filter(id => id.toString() !== userId);
        await viaggio.save();

        const notifica = await Notifica.create({
            destinatario: viaggio.autore,
            mittente: userId,
            tipo: 'abbandono',
            itinerario: viaggio._id,
            messaggio: `Un utente ha abbandonato il viaggio per ${viaggio.destinazione}`
        });

        await notifica.populate('mittente', 'username');
        await notifica.populate('itinerario', 'titolo');
        sendNotification(viaggio.autore, notifica);

        res.json({ success: true, message: "Hai abbandonato il viaggio" });
    } catch (err) {
         res.status(500).json({ error: err.message });
    }
};

// 11. GET NOTIFICHE
exports.getNotifiche = async (req, res) => {
    try {
        const notifiche = await Notifica.find({ destinatario: req.user.id })
            .sort({ createdAt: -1 })
            .populate('mittente', 'username')
            .populate('itinerario', 'titolo');

        res.json({ success: true, data: notifiche });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// 12. RIFIUTA PARTECIPANTE
exports.rifiutaPartecipante = async (req, res) => {
    try {
        const { viaggioId, utenteDaRifiutareId, notificaId } = req.body;
        
        const viaggio = await Itinerario.findById(viaggioId);
        if (viaggio.autore.toString() !== req.user.id) return res.status(403).json({ message: "Non autorizzato" });

        viaggio.richiestePendenti = viaggio.richiestePendenti.filter(id => id.toString() !== utenteDaRifiutareId);
        await viaggio.save();

        if (notificaId) await Notifica.findByIdAndDelete(notificaId);

        const notifica = await Notifica.create({
            destinatario: utenteDaRifiutareId,
            mittente: req.user.id,
            tipo: 'richiesta_rifiutata',
            itinerario: viaggio._id,
            messaggio: `La tua richiesta per il viaggio ${viaggio.destinazione} è stata rifiutata.`
        });

        await notifica.populate('mittente', 'username');
        await notifica.populate('itinerario', 'titolo');
        sendNotification(utenteDaRifiutareId, notifica);

        res.json({ success: true, message: "Richiesta rifiutata" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 13. SEGNA TUTTE COME LETTE
exports.segnaTutteLette = async (req, res) => {
    try {
        await Notifica.updateMany(
            { destinatario: req.user.id, letta: false },
            { $set: { letta: true } }
        );
        res.json({ success: true, message: "Tutte le notifiche segnate come lette" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// 14. CANCELLA NOTIFICA
exports.cancellaNotifica = async (req, res) => {
    try {
        const notifica = await Notifica.findById(req.params.id);
        if (!notifica) return res.status(404).json({ message: "Notifica non trovata" });
        if (notifica.destinatario.toString() !== req.user.id) return res.status(403).json({ message: "Non autorizzato" });

        await Notifica.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Notifica eliminata" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// 15. RIMUOVI PARTECIPANTE (KICK)
exports.rimuoviPartecipante = async (req, res) => {
    try {
        const { viaggioId, utenteDaRimuovereId } = req.body;
        const viaggio = await Itinerario.findById(viaggioId);
        
        if (viaggio.autore.toString() !== req.user.id) return res.status(403).json({ message: "Non autorizzato" });

        viaggio.partecipantiAttuali = viaggio.partecipantiAttuali.filter(id => id.toString() !== utenteDaRimuovereId);
        viaggio.richiestePendenti = viaggio.richiestePendenti.filter(id => id.toString() !== utenteDaRimuovereId);
        await viaggio.save();

        const notifica = await Notifica.create({
            destinatario: utenteDaRimuovereId,
            mittente: req.user.id,
            tipo: 'rimozione_partecipante',
            itinerario: viaggio._id,
            messaggio: `Sei stato rimosso dal viaggio: ${viaggio.destinazione}.`
        });

        await notifica.populate('mittente', 'username');
        await notifica.populate('itinerario', 'titolo');
        sendNotification(utenteDaRimuovereId, notifica);

        res.json({ success: true, message: "Utente rimosso" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// 16. ACCETTA INVITO
exports.accettaInvito = async (req, res) => {
    try {
        const { viaggioId, notificaId } = req.body;
        const userId = req.user.id;

        const viaggio = await Itinerario.findById(viaggioId);
        if (!viaggio) return res.status(404).json({ message: "Viaggio non trovato" });

        if (viaggio.partecipantiAttuali.includes(userId)) {
            await Notifica.deleteMany({ destinatario: userId, tipo: 'invito_viaggio', itinerario: viaggioId });
            return res.json({ success: true, message: "Sei già partecipante!" });
        }

        viaggio.partecipantiAttuali.push(userId);
        await viaggio.save();

        if (notificaId) {
            await Notifica.findByIdAndDelete(notificaId);
        } else {
            await Notifica.deleteMany({ destinatario: userId, tipo: 'invito_viaggio', itinerario: viaggioId });
        }

        const notifica = await Notifica.create({
            destinatario: viaggio.autore,
            mittente: userId,
            tipo: 'richiesta_accettata',
            itinerario: viaggio._id,
            messaggio: `ha accettato il tuo invito per il viaggio: ${viaggio.destinazione}`
        });

        await notifica.populate('mittente', 'username');
        await notifica.populate('itinerario', 'titolo');
        sendNotification(viaggio.autore, notifica);

        res.json({ success: true, message: "Invito accettato" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// 17. SEGNA UNA SINGOLA NOTIFICA COME LETTA
exports.segnaNotificaLetta = async (req, res) => {
    try {
        const notificaId = req.params.id;
        
        await Notifica.findByIdAndUpdate(notificaId, { letta: true });
        
        res.json({ success: true, message: "Notifica segnata come letta" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};