const mongoose = require('mongoose');

const galleryItemSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    default: ''
  },
  imagePath: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('GalleryItem', galleryItemSchema);
