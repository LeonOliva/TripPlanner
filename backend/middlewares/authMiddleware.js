const jwt = require('jsonwebtoken');

const verifyAccessToken = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Non autorizzato: Token mancante' });
    }

    const token = authHeader.split(' ')[1]; 
    const secret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
    
    jwt.verify(token, secret, (err, decoded) => {
    if (err) {
        console.error('Errore Token:', err.message);
        return res.status(403).json({ message: 'Token non valido' }); 
    }
        // Mappiamo l'ID in modo sicuro provando tutte le varianti comuni
        req.user = {
            id: decoded.userId || decoded.id || decoded._id, 
            email: decoded.email
        };

        console.log("✅ ID UTENTE ESTRATTO:", req.user.id);
        
        next();
    }); 
};

module.exports = { verifyAccessToken };