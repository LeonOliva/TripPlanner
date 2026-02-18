const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true 
    },
    password: {
        type: String,
        // La password è richiesta solo se NON c'è googleId
        required: function() { return !this.googleId; }, 
        minlength: 6
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true 
    }, // <--- ECCO LA VIRGOLA CHE MANCAVA!
    
    isVerified: { type: Boolean, default: false }, 
    verificationToken: { type: String },
});

// Middleware pre-save: Hasha la password automaticamente prima di salvare
userSchema.pre('save', async function (next) {
    // Se non c'è password (utente Google) o non è stata modificata, vai avanti
    if (!this.password || !this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
}

const User = mongoose.model("User", userSchema);
module.exports = User;