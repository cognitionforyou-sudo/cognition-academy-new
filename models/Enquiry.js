const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  parentName: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  whatsapp: {
    type: String,
    trim: true
  },
  currentClass: {
    type: String,
    trim: true
  },
  course: {
    type: String,
    required: true,
    trim: true
  },
  school: {
    type: String,
    trim: true
  },
  message: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Contacted'],
    default: 'Pending'
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Enquiry', enquirySchema);
