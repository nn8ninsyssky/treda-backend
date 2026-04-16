// src/models/mongo/ComplaintDetail.js

const mongoose = require('mongoose');

const complaintDetailSchema = new mongoose.Schema({
  complaint_id: {
    type: String,
    required: true,
    index: true,
  },
  customer_id: {
    type: String,
  },
  description: {
    type: String,
  },
  resolution_notes: {
    type: String,
  },
  visit_notes: {
    type: String,
  },
  visit_log: [
    {
      note: String,
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

module.exports = mongoose.model('ComplaintDetail', complaintDetailSchema);