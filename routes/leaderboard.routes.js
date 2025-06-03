const express = require('express');
const router = express.Router();

const leaderboardController = require('../controllers/leaderboard.controller');

// POST → Score speichern
router.post('/', leaderboardController.submitScore);

module.exports = router;