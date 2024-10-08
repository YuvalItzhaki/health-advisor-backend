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
        // Check if user exists in the database
        let user = await User.findOne({ googleId: profile.id });
        
        if (user) {
          // Update the access token
          user.accessToken = accessToken;
          await user.save();
          console.log('Updated existing user with new accessToken:', user.accessToken);
        } else {
          // If no user exists, create a new one
          user = new User({
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0].value,
            accessToken,
          });
          await user.save();
          console.log('Created new user:', user);
        }
        
        // Return the user object (not just the access token)
        return done(null, user);

      } catch (error) {
        done(error, false);
      }
    }
  )
);

// Serialize and deserialize user (for session management)
passport.serializeUser((user, done) => {
  done(null, user.id); // Serialize user ID
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id); // Deserialize by finding the user in the DB
    done(null, user); // Return the user object
  } catch (error) {
    done(error, null);
  }
});


module.exports = passport;
