const mongoose = require("mongoose");

const itinerarioSchema = new mongoose.Schema({
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
    partecipantiMax: { type: Number, min: 1, default: 1 }, 
    partecipantiAttuali: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    richiestePendenti: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    stato: { type: String, default: 'bozza' },
    luoghi: [{ type: String }] 
}, { timestamps: true, collection: 'itinerario' });

module.exports = mongoose.model("Itinerario", itinerarioSchema);