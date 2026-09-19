const mongoose = require('mongoose');

const resultItemSchema = new mongoose.Schema({
  studentName: {
    type: String,
    trim: true,
    default: ''
  },
  imagePath: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ResultItem', resultItemSchema);
