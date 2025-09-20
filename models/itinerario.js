//quelli creati dagli utenti e salvati su MongoDB
//Struttura itinerari
const mongoose = require("mongoose");

const itinerarioSchema = new mongoose.Schema({
    titolo: {
        type: String,
        required:true,
        maxlength:100,
        trim:true
    },
    descrizione: {
        type:String,
        maxlength:500,
        trim:true
    },
    luoghi:[{
        type:String,
        trim:true
    }],
    travelMode:{
        type:String,
        enum:{
            values:['DRIVING','WALKING','BYCLING','TRANSIT']
        },
        default:'DRIVING',
        uppercase:true //credo prenda il valore e lo metta maiuscolo
    },
    stato:{
        type:String,
        enum:['bozza','completato'],
        default:'bozza'
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    updateAt:{
        type:Date,
        default:Date.now
    }
},{     //Opzioni dello schema
        timestamps:true, //Aggiunge autometicamente createdAt e updateAt
        collection:'itinerario'
});

//Middleware per aggiornare updatedAt prima del salvataggio
itinerarioSchema.pre('save',function(next){
    this.updateAt = new Date();
    next();
});

module.exports = mongoose.model("Itinerario", itinerarioSchema); 