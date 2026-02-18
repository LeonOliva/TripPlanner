const mongoose = require("mongoose");

const itinerarioSchema = new mongoose.Schema({
    // ... i tuoi campi esistenti (titolo, autore, origine, etc.) rimangono uguali ...
    titolo: { type: String, required: true, maxlength: 100, trim: true },
    autore: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    origine: { type: String, required: true, trim: true },
    destinazione: { type: String, required: true, trim: true },
    tappe: [{ type: String, trim: true }],
    immagine: { type: String },
    dataInizio: { type: Date, required: true },
    dataFine: { type: Date, required: true },
    travelMode: { type: String, default: 'FLIGHT' },
    visibilita: { type: String, default: 'pubblica' },
    condivisoCon: [{ type: String }], 
    
    // 👇 AGGIUNGI QUESTI CAMPI NUOVI 👇
    partecipantiMax: { type: Number, min: 1, default: 1 }, 
    
    // Chi è stato accettato
    partecipantiAttuali: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    
    // Chi ha chiesto di entrare ma aspetta conferma
    richiestePendenti: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // 👆 FINE AGGIUNTA 👆

    stato: { type: String, default: 'bozza' },
    luoghi: [{ type: String }] 
}, { timestamps: true, collection: 'itinerario' });

module.exports = mongoose.model("Itinerario", itinerarioSchema);