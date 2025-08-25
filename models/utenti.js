const moongose = require('moongose')

const userSchema = new moongose.Schema({
    username:{
        type: String,
        required: true,
        trim: true //serve a togliere gli spazi bianchi prima e dopo la stringa
    },
    email:{
        type: String,
        required: true,
        trim: true
    },
    password:{
        type: String,
        required: true,
        minlength: 6 
    }
});

//creazione del modello a partire dallo scherma
const User = mongooose.model("User", userSchema);

//esportazione del modello
module.exports = User;