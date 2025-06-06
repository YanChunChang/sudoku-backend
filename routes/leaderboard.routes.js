const express = require('express');
const router = express.Router();

const leaderboardController = require('../controllers/leaderboard.controller');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware , leaderboardController.submitScore);
router.post('/guest', leaderboardController.submitScoreGuest);
router.get('/', leaderboardController.getLeaderBoard);

module.exports = router;