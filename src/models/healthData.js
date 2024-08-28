const mongoose = require('mongoose');

const healthDataSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    weight: Number,
    height: Number,
    bloodPressure: String,
    heartRate: Number,
    cholesterolLevel: Number,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });
  
  const HealthData = mongoose.model('HealthData', healthDataSchema);
  
  module.exports = HealthData;
  