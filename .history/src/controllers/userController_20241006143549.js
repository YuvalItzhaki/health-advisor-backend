const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  console.log('Authenticating user:', email);

  const user = await User.findOne({ email });

  if (user) {
    console.log('User found:', user);
  } else {
    console.log('User not found');
  }

  if (user && (await user.matchPassword(password))) {
    res.cookie('authToken', generateToken(user._id), { httpOnly: false, secure: true, sameSite: 'strict' });
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password.' });;
    // throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  console.log('Register endpoint hit');

  const { name, email, password } = req.body;
  console.log('Registering user:', { name, email, password });

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists. Please login.' });
  }

  // Hashing password and creating the user
  const user = await User.create({ name, email, password, googleId: req.body.googleId || undefined });

  if (user) {
    const token = generateToken(user._id); // Function to generate JWT token
    console.log('Token for registered user is: ', token)

    // Send the token in a secure HTTP-only cookie
    res.cookie('authToken', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production', // Set true only in production
      sameSite: 'Lax',
      // maxAge: 24 * 60 * 60 * 1000, // Token expires in 1 day (adjustable)
    });

    // Send user info and token back in the response
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});


const getUserProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = { authUser, registerUser, getUserProfile };
