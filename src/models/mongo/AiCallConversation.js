// src/models/mongo/AiCallConversation.js

const mongoose = require('mongoose');

const aiCallConversationSchema = new mongoose.Schema({
  call_log_id: {
    type: String,
    required: true,
    index: true,
  },
  conversation: [
    {
      speaker: String, // 'AI' or 'User'
      message: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

module.exports = mongoose.model('AiCallConversation', aiCallConversationSchema);
