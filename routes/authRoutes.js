const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

//register
router.post('/register',authController.registerUser);

//login
router.post('/login', authController.loginUser);

//refresh(GET o POST dipende dalle preferenze, in genere meglio POST)
router.post('/refresh', authController.refreshToken);

//logout
router.post('/logout',authController.logoutUser);

module.exports = router;

