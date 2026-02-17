const mongoose = require('mongoose');

const notificaSchema = new mongoose.Schema({
  destinatario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mittente: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tipo: { type: String, enum: ['richiesta_partecipazione', 'richiesta_accettata', 'richiesta_rifiutata', 'abbandono', 'rimozione_partecipante', 'invito_viaggio'], required: true },
  messaggio: { type: String },
  itinerario: { type: mongoose.Schema.Types.ObjectId, ref: 'Itinerario' },
  letta: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notifica', notificaSchema);