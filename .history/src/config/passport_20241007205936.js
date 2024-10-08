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
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          user.accessToken = accessToken; // Store accessToken in the user model
          await user.save();
          return done(null, user); // Return user object, not the token
        }

        // If the user does not exist, create a new user
        user = new User({
          googleId: profile.id,
          displayName: profile.displayName,
          email: profile.emails[0].value,
          accessToken, // Store accessToken
        });
        await user.save();
        done(null, user); // Return user object, not the token
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
