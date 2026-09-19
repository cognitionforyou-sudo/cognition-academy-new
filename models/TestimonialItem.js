const mongoose = require('mongoose');

const testimonialItemSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  college: {
    type: String,
    required: true,
    trim: true
  },
  videoPath: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TestimonialItem', testimonialItemSchema);
