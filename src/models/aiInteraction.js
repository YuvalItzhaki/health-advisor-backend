const mongoose = require('mongoose');

const aiInteractionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    query: { type: String, required: true },
    response: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  });
  
  const AIInteraction = mongoose.model('AIInteraction', aiInteractionSchema);
  
  module.exports = AIInteraction;
  