//Ho compreso tutto il file
const mongoose = require('mongoose');
const bcrpyt = require('bcryptjs'); //per fare l'hash delle password
const userSchema = new mongoose.Schema({
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

//middleware pre-save per hashare la passsword prima di salvarla (pre-save)
userSchema.pre('save',async function (next) {
    //esegui l'hashing solo se la passoword è stata modificata (o è nuova)
    if (!this.isModified('password')){
        return next(); 
    }
    //hashing con bcrypt
    try{
        const salt = await bcrpyt.genSalt(10); //genera una stringa casuale che rende l'hash unico (anche con stesse password)
        this.password = await bcrpyt.hash (this.password, salt); //crea la password cifrata e la sostituisce alla vecchia password.
        next(); //Salva la passwrod hashata nel DB (che contiene solo password hashate)
    }catch(error){
        next(error); //non salvare, ferma tutto e restituisci errore
    }
    
});

//metodo per confrontare la password inserita con quella hashata nel DB. 
userSchema.methods.comparePassword = async function (candidatePassword){
    return bcrpyt.compare(candidatePassword, this.password)
}

//creazione del modello a partire dallo scherma
const User = mongoose.model("User", userSchema);

//esportazione del modello
module.exports = User;