// Central export — always import from here, not individual files

const EnquiryNote        = require('./EnquiryNote');
const ComplaintDetail    = require('./ComplaintDetail');
const AiCallConversation = require('./AiCallConversation');

module.exports = { EnquiryNote, ComplaintDetail, AiCallConversation };