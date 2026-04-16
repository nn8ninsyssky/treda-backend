// src/models/mongo/EnquiryNote.js

const mongoose = require('mongoose');

const enquiryNoteSchema = new mongoose.Schema({
  enquiry_id: {
    type: String,
    required: true,
    index: true,
  },
  note: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('EnquiryNote', enquiryNoteSchema);