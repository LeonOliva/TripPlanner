//import librerie necessarie
const User = require('../models/User') 
const RefreshToken = require ('../models/refreshToken')
const jwt = require ('jsonwebtoken'); 
const crypto = require('crypto');
const nodemailer = require('nodemailer'); 

// --- CONFIGURAZIONE EMAIL ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'poulgigi839@gmail.com',
        pass: 'wwgz vxoj xwcw bdmi'
    },
    //antivirus
    tls: {
        rejectUnauthorized: false
    }
});

// Funzione helper per generare i token
const generateTokens = (user) => { 
    const accessToken = jwt.sign( 
        {
            userId: user._id,
            username: user.username, 
            email: user.email       
        }, 
        process.env.ACCESS_TOKEN_SECRET, 
        {expiresIn: '15m'} 
    );
    const refreshToken = jwt.sign(
        {userId: user._id}, 
        process.env.REFRESH_TOKEN_SECRET, 
        {expiresIn: '7d'} 
    );
    return {accessToken, refreshToken}; 
};

// --- REGISTRAZIONE UTENTE (MODIFICATA) ---
exports.registerUser = async (req, res) => {
    try {
        console.log("1. Inizio registrazione...");
        const { username, email, password } = req.body;

        // Verifica esistenza
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log("ERRORE: Email già usata");
            return res.status(400).json({ message: "Email già in uso" });
        }

        console.log("2. Creazione token verifica...");
        const verifyToken = crypto.randomBytes(32).toString('hex');

        console.log("3. Salvataggio utente nel DB...");
        const newUser = new User({
            username,
            email,
            password, 
            verificationToken: verifyToken,
            isVerified: false
        });
        await newUser.save();
        console.log("✅ Utente salvato nel DB!");

        console.log("4. Tentativo invio email a:", email);
        const verifyUrl = `http://localhost:5173/verify-email/${verifyToken}`;

    } catch (error) {
        console.error("❌ ERRORE GRAVE NEL BACKEND:", error);
        res.status(500).json({ message: "Errore durante la registrazione" });
    }
};

// --- VERIFICA EMAIL ---
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.body; 

        const user = await User.findOne({ verificationToken: token });
        if (!user) return res.status(400).json({ success: false, message: "Token non valido o scaduto" });

        user.isVerified = true;
        user.verificationToken = undefined; // Rimuoviamo il token usato
        await user.save();

        res.json({ success: true, message: "Email verificata con successo! Ora puoi fare il login." });

    } catch (error) {
        console.error("Errore verifica:", error);
        res.status(500).json({ message: "Errore durante la verifica", error });
    }
};

// --- LOGIN UTENTE ---
exports.loginUser = async (req,res) => {
    try{
        const{email,password} = req.body;
        if(!email || !password){
            return res.status(400).json({message:"Email e password sono obbligatori."});
        }

        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({message:"Credenziali non valide"});
        }

        if (!user.isVerified) {
            return res.status(403).json({ message: "Devi verificare la tua email prima di accedere!" });
        }

        const isMatch = await user.comparePassword(password);
        if(!isMatch){
            return res.status(401).json({message:"Credenziali non valide"});
        }

        // Generazione token
        const {accessToken, refreshToken} = generateTokens(user);

        console.log(`[LOGIN] Salvataggio refresh token nel DB:${refreshToken} per utente ${user._id}`)
        await RefreshToken.create({token:refreshToken, userId: user._id}); 

        res.cookie('jwt',refreshToken, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'Strict', 
            maxAge: 7*24*60*60*1000 
        });

        res.json({
            message:"Login effettuato con successo!",
            accessToken,
            user:{ 
                id:user._id,
                username:user.username,
                email:user.email
            }
        });
    }catch(error){
        console.error("Errore login: ", error);
        res.status(500).json({message:"Errore del server durante il login."});
    }
};

exports.refreshToken = async (req, res) => {
    const cookies = req.cookies; 
    if(!cookies?.jwt){ 
        return res.status(401).json({message:"Non autorizzato: Refresh Token mancante"});
    }

    const refreshTokenFromCookie = cookies.jwt; 

    try{
        const foundToken = await RefreshToken.findOne({token:refreshTokenFromCookie});
        if(!foundToken){
            return res.status(403).json({message:"Proibito Refresh token non valido o scaduto."});
        }

        jwt.verify(refreshTokenFromCookie, process.env.REFRESH_TOKEN_SECRET, async(err,decoded) => { 
            if(err || foundToken.userId.toString() !== decoded.userId) { 
                return res.status(403).json({message:"Proibito: Refresh token non valido o scaduto."})
            }

            const user = await User.findById(decoded.userId);
            const { accessToken } = generateTokens(user);
            
            res.json({accessToken});
        });
    }catch(error){
        console.error("Errore refresh token", error);
        res.status(500).json({message:"Errore del server durante il refresh del token"});
    }
};

exports.logoutUser = async (req,res) => {
    const cookies = req.cookies;
    if(!cookies?.jwt){  
        return res.sendStatus(204); 
    }
    const refreshTokenFromCookie = cookies.jwt;  

    try{
        await RefreshToken.deleteOne({token: refreshTokenFromCookie});

        res.clearCookie('jwt', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite:'Strict'
        });
        res.status(200).json({message:"Logout effettuato con successo."});
    }catch(error){
        console.error("Errore logout:",error);
        res.status(500).json({message: "Errore del serrver il logout"});
    }
};

exports.googleCallback = async (req, res) => {
    try {
        const user = req.user;
        const { accessToken, refreshToken } = generateTokens(user);

        await RefreshToken.create({ token: refreshToken, userId: user._id });

        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.redirect(`http://localhost:5173/dashboard?accessToken=${accessToken}`);

    } catch (error) {
        console.error("Errore Google Callback:", error);
        res.redirect('http://localhost:5173/login?error=google_auth_failed');
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password'); 

        if (!user) {
            return res.status(404).json({ success: false, message: "Utente non trovato" });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.username, 
                email: user.email
            }
        });
    } catch (error) {
        console.error("Errore getMe:", error);
        res.status(500).json({ success: false, message: "Errore server" });
    }
};