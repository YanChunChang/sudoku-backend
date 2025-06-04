const LeaderboardEntry = require('../models/leaderboard.model');

exports.submitScore = async (req, res) => {
    try {
        const { playerMode, playMode, level, time, date } = req.body;
        console.log('req.user:', req.user);

        if (!req.user || !req.user.username) {
            return res.status(400).json({ message: 'Missing user data' });
        }

        nickname = req.user.username;
        userType = 'registered';

        if (!playerMode || !playMode || !level || !time) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newEntry = new LeaderboardEntry({
            nickname: nickname.trim(),
            userType,
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

exports.submitScoreGuest = async (req, res) => {
    try {
        const { nickname, playerMode, playMode, level, time, date } = req.body;

        if (!playerMode || !playMode || !level || !time) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const userType = 'guest';

        const newEntry = new LeaderboardEntry({
            nickname: nickname.trim(),
            userType,
            playerMode,
            playMode,
            level,
            time,
            date: date ? new Date(date) : undefined
        });

        await newEntry.save();

        res.status(201).json({ message: 'Score saved (guest)' });
    } catch (error) {
        console.error('Error saving guest score:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

//if there is no query, find({}) will give all entries
exports.getLeaderBoard = async (req, res) => {
    try {
        const { playerMode, playMode, level, limit } = req.query;

        const query = {};
        if (playerMode) query.playerMode = playerMode;
        if (playMode) query.playMode = playMode;
        if (level) query.level = level;

        const topLimit = parseInt(limit) || 10;

        const entries = await LeaderboardEntry.find(query)
            .sort({ time: 1 }) 
            .limit(topLimit)
            .exec();

        res.status(200).json(entries);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};