const express = require('express');
const { authUser, registerUser, getUserProfile } = require('../controllers/userController');
const {googleRegister} = require('../controllers/authController');

// const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', authUser);
router.post('/register', registerUser);
router.post('/google-register', googleRegister);
// router.get('/user', protect, getUserProfile);

module.exports = router;
