const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
    nickname: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30
    },
    playerMode: {
      type: String,
      enum: ['single', 'multi'],
      required: true
    },
    playMode: {
      type: String,
      enum: ['normal', 'countdown'],
      required: true
    },
    level: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'expert'],
      required: true
    },
    time: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  });
  
  module.exports = mongoose.model('LeaderboardEntry', leaderboardSchema);