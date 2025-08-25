const mongoose = require ('mongoose')

const refreshTokenSchema = new mongoose.Schema({
    token:{
        type: String,
        required: true,
        unique: true //non possono esserci duplicati
    },
    userId:{ //è un objectID che riferimento alla collezione User
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', //serve a collegare il token al suo utente
        required: true
    },
    CreatedAt:{
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('RefreshToken',refreshTokenSchema)