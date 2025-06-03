const LeaderboardEntry = require('../models/leaderboard.model');

exports.submitScore = async (req, res) => {
    const { nickname, playerMode, playMode, level, time, date } = req.body;

    try {
        // Basic Validation
        if (!nickname || !playerMode || !playMode || !level || !time) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newEntry = new LeaderboardEntry({
            nickname: nickname.trim(),
            playerMode,
            playMode,
            level,
            time,
            date: date ? new Date(date) : undefined
        });

        await newEntry.save();
        res.status(201).json({ message: 'Score saved!' });
    } catch (error) {
        console.error('Error saving score:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}