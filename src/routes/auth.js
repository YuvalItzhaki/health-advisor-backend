const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const HealthData = require('../models/healthData');

// Register Route
router.post('/register', async (req, res) => {
  const { email, password, name, age, gender, medicalHistory } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ email, password: hashedPassword, name, age, gender, medicalHistory });
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('req.body:', req.body);

  try {
      const user = await User.findOne({ email });
      console.log('User found:', user); // Debugging log

      if (user && await bcrypt.compare(password, user.password)) {
          // Password is correct, generate a token
          const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

          // Fetch health data associated with the user
          const healthData = await HealthData.findOne({ userId: user._id });

          res.json({
            token: token,
            _id: user._id,
            name: user.name,
            email: user.email,
            healthData: healthData || {} // Send healthData if found, otherwise send an empty object
          });
      } else {
          console.log('Invalid credentials'); // Debugging log
          res.status(400).json({ message: 'Invalid credentials' });
      }
  } catch (err) {
      console.error('Error:', err); // Debugging log
      res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
