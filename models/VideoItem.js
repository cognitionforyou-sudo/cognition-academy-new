const mongoose = require('mongoose');

const videoItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  youtubeId: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    enum: ['physics', 'chemistry', 'maths', 'biology'],
    lowercase: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('VideoItem', videoItemSchema);
