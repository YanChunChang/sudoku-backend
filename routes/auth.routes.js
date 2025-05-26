const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/register', authController.register);
router.get('/verify', authController.verifyEmail);

module.exports = router;