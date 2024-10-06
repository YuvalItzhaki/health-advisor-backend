const mongoose = require('mongoose');

const healthDataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional for Google users
  googleId: { type: String, sparse: true, default: undefined }, // Optional for users who log in with Google
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
}, { timestamps: true });

const HealthData = mongoose.model('HealthData', healthDataSchema);

module.exports = HealthData;
