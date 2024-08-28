const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Register Route
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ email, password: hashedPassword });
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
            // Password is correct, generate a token or return user data
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
            res.json({ token });
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
