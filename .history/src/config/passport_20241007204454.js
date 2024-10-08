const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User'); // Adjust the path as necessary

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALL_BACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ googleId: profile.id });
        if (existingUser) {
          existingUser.accessToken = accessToken; // Save accessToken
          await existingUser.save();
          console.log('existingUser: ', existingUser)
          return done(null, existingUser);
        }
        const newUser = new User({
          googleId: profile.id,
          displayName: profile.displayName,
          email: profile.emails[0].value,
          accessToken,
        });
        console.log('newUser:', newUser)
        await newUser.save();
        done(null, newUser);
      } catch (error) {
        done(error, false);
      }
    }
  )
);

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

module.exports = passport;
