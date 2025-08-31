//Ho compreso tutto il file
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); //per chiamare le funzioni ad authcontroller

// api/auth/register
router.post('/register',authController.registerUser);

// api/auth/login
router.post('/login', authController.loginUser);

// api/auth/refresh (GET o POST dipende dalle preferenze, in genere meglio POST)
router.post('/refresh', authController.refreshToken);

// api/auth/logout
router.post('/logout',authController.logoutUser); //verifyAccessToken non serve qui perché si basa sul cookie

module.exports = router;

