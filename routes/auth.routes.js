const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

//register
router.post('/register', authController.register);
router.get('/verify', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerificationEmail);

//login
router.post('/login', authController.login);
router.post('/login/recover-email', authController.recoverEmail);
router.post('/reset-password', authController.resetPassword);

module.exports = router;