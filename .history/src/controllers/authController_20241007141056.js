const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:5001/api/auth/google/callback',
      scope: [
        'profile', 
        'email',
        'https://www.googleapis.com/auth/fitness.activity.read',
        'https://www.googleapis.com/auth/fitness.body.read',
        'https://www.googleapis.com/auth/fitness.heart_rate.read'
      ]
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ googleId: profile.id });
        if (existingUser) {
          return done(null, existingUser);
        }
        const newUser = new User({
          googleId: profile.id,
          // displayName: profile.displayName,
          email: profile.emails[0].value,
        });
        await newUser.save();
        done(null, newUser);
      } catch (error) {
        done(error, false);
      }
    }
  )
);

exports.googleRegister = async (req, res) => {
  const { googleId, displayName, email } = req.body;

  try {
    // Check if the user already exists
    let user = await User.findOne({ googleId });
    if (user) {
      console.log('lalalgggga')
      return res.status(200).json(user); // If user already exists, return the user
    }
    console.log('lalala')

    // If user doesn't exist, create a new one
    user = new User({
      googleId,
      // displayName,
      email,
      // You can add default values for any other fields your User schema requires
    });

    await user.save();

    return res.status(201).json(user); // Return the newly created user
  } catch (error) {
    console.error('Error registering Google user:', error);
    return res.status(500).json({ message: 'Server error during Google registration' });
  }
};

// Serialize and deserialize user (for session management)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
