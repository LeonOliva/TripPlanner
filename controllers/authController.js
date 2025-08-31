//import librerie necessarie
const User = require('../models/user') //per usare il modello
const RefreshToken = require ('../models/refreshToken')
const jwt = require ('jsonwebtoken'); //per creare, firmare e verficare JSON Web Token
const refreshToken = require('../models/refreshToken');

//funzione helper per generare i token (capita)
const generateTokens = (userId) => { //crea un token con l'ID di questo utente
    const accessToken = jwt.sign( //la funzione jwt che serve per creare effettivamente il token
        {userId: userId}, //payload che riceve la funzione, identifica l'utente 
        process.env.ACCESS_TOKEN_SCECRET, //chiave segreta con cui è firmato il token (contenuta in un file .env)
        {expiresIn: '15m'} //Access token a breve scadenza
    );
    const refreshToken = jwt.sign(
        {userId: userId}, //payload
        process.env.REFRESH_TOKEN_SECRET, //chiave segreta
        {expiresIn: '7d'} //Refresh token a lunga scadenza
    );
    return {accessToken, refreshToken}; //serve per utilizzare access e refresh token fuori dalla funzione generate tokens
};

//Registarazione Utente
exports.registerUser = async (Req, res) => {
    try{
        const{username, email, password} = req.body;

        //controlla se l'utente o la mail esistono già
        const existingUserByUsername = await User.findOne({username}); //await (va solo se c'è async) serve per aspettare che una promise finisca prima di proseguire ocn il codice (aspetta il risultato della find prima di fare l'if)
        if(existingUserByUsername){ //findOne è un metodo di mongoose, cerca la prima corrispondenza nel documento con la condizione data (è una query), si usa con await o .then()
            return res.status(400).json({message:"Username già in uso"}); //uso il return perchè così interrompo l'esecuzione del codice, se scrivessi solo res.. verrebbe eseguito anche ciò che viene dopo
        }                                                                   
        const existingUserByEmail = await User.findOne({email});
        if(existingUserByEmail){
            return res.status(400).json({message:"Email già in uso"});
        }

        const newUser = new User({username, email, password});
        await newUser.save() //.save() salva e ritorna l'oggetto appena scritto nel DB; la password viene hashata dal middleware pre-save nel modello User

        res.status(201).json({message:"Utente registrato con successo", userId:newUser._id})
    }
    catch(error){
        console.error("Errore di registrazione", error);
        
        //Gestione degli errori di validazione di moongose
        if(error.name === "ValidationError"){ //=== sta per uguaglianza stretta, stesso valore e stesso tipo
            const messages = Object.values(error.errors).map(val => val.message); //error.errors contiene un oggetto con i dettagli di tutti gli errori di validazione (per ogni campo sbagliato), Object.values trasforma quell'oggetto in array,.map(val => val.message) estrae solo il messaggio di errore da ogni elemento
            return res.status(400).json({messagge: messages.join('.')}) //join permette di concatenere tutte le stringhe, separandole con un punto
        }
        res.status(500).json({messagge:"Errore del server durante la registrazione"});
    }
};

//Login Utente
exports.loginUser = async (req,res) => {
    try{
        const{email,password} = req.body;
        if(!email || !password){
            return res.status(400).json({message:"Email e password sono obbligatori."});
        }

        //La ricerca dell'utente viene fatta per email
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({message:"Credenziali non valide"});
        }

        const isMatch = await user.comparePassword(password);
        if(!isMatch){
            return res.status(401).json({message:"Credenziali non valide"});
        }

        //Se le credenziali sono valide, allora creo il token
        const {accessToken, refreshToken} = generateTokens(user._id);

        //Imposta il refresh token nel database + Log per debug
        console.log(`[LOGIN] Salvataggio refresh token nel DB:${refreshToken} per utente ${user._id}`)
        await RefreshToken.create({token:refreshToken, userId: user._id}); //salva il refresh token nella collezione RefreshToken nel database

        //Imposta il refresh token in un cookie HTTP only
        res.cookie('jwt',refreshToken, { //imposta un cookie sul browser dell'utente, il cookie si chiamerà jwt e conterrà il refresh token 
            httpOnly: true, //accessibile solo dal server web, non dal client (più sicuro)
            secure: process.env.NODE_ENV === 'production', //solo su HTTPS (in produzione, ovvero se l'app quanto l'app è attiva su un server pubblico)
            sameSite: 'Strict', //Aiuta a prevenire CSRF(Cross-site Request Forgery), il cookie viene inviato solo se la richiesta parte dallo stesso dominio
            maxAge: 7*24*60*60*1000 //7 giorni (come la scadenza del token) 
        });

        //Invia l'access token al client nel corpo della risposta
        res.json({
            message:"Login effettuato con successo!",
            accessToken,
            user:{ //Invia alcune info utente non sensibili
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

//Refresh Access Token
exports.refreshToken = async (req, res) => {
    const cookies = req.cookies; //prende i cookie dalla richiesta
    if(!cookies?.jwt){ //controlla se c'è il cookie jwt
        return res.status(401).json({message:"Non autorizzato: Refresh Token mancante"});
    }

    const refreshTokenFromCookie = cookies.jwt; //Estraggo il token dal cookie

    //Debug
    console.log(`[REFRESH] Tentativo di refresh con token dal cookie: ${refreshTokenFromCookie}`);
    const foundToken = await RefreshToken.findOne({token: refreshTokenFromCookie});//cerca nel DB nella collezione RefreshToken il primo documento che abbia token = refreshTokenFromCookie
    if(!foundToken){
        console.log(`[REFRESH] Token ${refreshTokenFromCookie} NON trovato nel DB. Accesso negato.`);
        return res.status(403).json({message:"Proibito: Refresh Token non valido o scaduto (non in DB)."});
    }
    console.log(`[REFRESH] Token ${refreshTokenFromCookie} TROVATO nel DB. Procedo con la verifica JWT`);

    try{
        //Cerca il refresh token nel DB
        const foundToken = await RefreshToken.findOne({token:refreshTokenFromCookie});
        if(!foundToken){
            //Se il token non è nel DB ma era nel cookie, potrebbe essere stato compromesso o è vecchio
            //Per maggiore sicurezza, potremmo invalidare tutti i refresh token di questo utente
            //e richiedere un nuovo login. Per ora restituiamo solo un errore.
            return res.status(403).json({message:"Proibito Refresh token non valido o scaduto."});
        }

        //Verifica il refresh token
        jwt.verify(refreshTokenFromCookie, process.env.REFRESH_TOKEN_SECRET, async(err,decoded) => { //controlla che il refresh token sia valido tramite la chiave REFRESH_TOKEN_SECRET
            if(err || foundToken.userId.toString() !== decoded.userId) { //verifica se lo userID del token sia uguale a quello contenuto nel DB
                //se la verifica fallisce o l'ID utente nel token non corrisposnde a quello nel DB
                return res.status(403).json({message:"Proibito: Refresh token non valido o scaduto."})
            }  //err è valorizzato solo se c'è un problema con il token, altrimenti sarà null, decoded contiene il payload del token se la verifica è andata a buon fine

            //Il refresh token è valido, genera un nuovo access token
            const newAccessToken = jwt.sign(
                {userId: decoded.userId},
                process.env.ACCESS_TOKEN_SCECRET,
                {expiresIn:'15m'}
            );
            
            res.json({accessToken: newAccessToken});
        });
    }catch(error){
        console.error("Errore refresh token", error);
        res.status(500).json({message:"Errore del server durante il refresh del token"});
    }
};

//Logout Utente
exports.logoutUser = async (req,res) => {
    const cookies = req.cookies;
    if(!cookies?.jwt){  //controllo se nei cookie c'è il cookie chiamato jwt (per refreshToken)
        return res.sendStatus(204); //No content, nessun cookie da eliminare
    }
    const refreshTokenFromCookie = cookies.jwt;  //preleva il token che il client aveva nei cookie (il refreshToken)

    //log per debug
    console.log(`[LOGOUT] Tentativo di eliminare refresh token dal DB: ${refreshTokenFromCookie}`);
    const result = await RefreshToken.deleteOne({token: refreshTokenFromCookie});
    console.log(`[LOGOUT] Risultato deleteOne: ${result.deletedCount}`);

    if(result.deletedCount === 0){
        console.warn(`[LOGOUT] ATTENZIONE: Nessun refresh token trovato nel DB da eliminare per il token: ${refreshTokenFromCookie}`);//serve per segnalare un avviso, appare in giallo e con il prefisso warning nel terminale
    }

    try{
        //Rimuovi il refresh token dal database
        await RefreshToken.deleteOne({token: refreshTokenFromCookie});//ripetuto non credo serve, ma lo f'a perchè non ha messo il return 

        //Pulici il cookie
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

//qui non serve esportare nulla perché gli exports sono fatti contestualmente alla definizione delle funzioni