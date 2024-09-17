const mongoose = require('mongoose');

const healthDataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weights: [
    {
      value: { type: Number, required: true },
      date: { type: Date, default: Date.now },
    }
  ],
  heights: [
    {
      value: { type: Number, required: true },
      date: { type: Date, default: Date.now },
    }
  ],
  age: Number,
  gender: String,
  bloodPressure: String,
  heartRate: Number,
  cholesterolLevel: Number,
}, { timestamps: true }); // This adds createdAt and updatedAt automatically

const HealthData = mongoose.model('HealthData', healthDataSchema);

module.exports = HealthData;
