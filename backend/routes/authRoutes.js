const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('passport');
const { verifyAccessToken } = require('../middlewares/authMiddleware');

// Registrazione Normale
router.post('/register', authController.registerUser);

// Login Normale
router.post('/login', authController.loginUser);

router.post('/verify-email', authController.verifyEmail);

// Refresh Token
router.get('/refresh', authController.refreshToken);

// Logout
router.get('/logout', authController.logoutUser);

router.get('/me', verifyAccessToken, authController.getMe);

// --- GOOGLE OAUTH ROUTES ---
router.get('/google', passport.authenticate('google', { 
    scope: ['profile', 'email'] 
}));

router.get('/google/callback', 
    passport.authenticate('google', { session: false, failureRedirect: '/login?error=google_fail' }),
    authController.googleCallback 
);

module.exports = router;
