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
          user.accessToken = accessToken;
          await user.save();
          console.log('Updated user with new access token:', user.accessToken);
          return done(null, user);
        }

        // If the user does not exist, create a new user and save the access token
        user = new User({
          googleId: profile.id,
          displayName: profile.displayName,
          email: profile.emails[0].value,
          accessToken,
        });
        console.log('New user created with access token:', user.accessToken);
        await user.save();
        done(null, user); // Return the new user
      } catch (error) {
        done(error, false);
      }
    }
  )
);

// Serialize and deserialize user for session management
passport.serializeUser((user, done) => {
  console.log('user from serializeUser: ', user.id)
  done(null, user._id.valueOf());  // Ensuring the user ID is stored in session
  
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);  // Retrieving user based on session-stored ID
    done(null, user);  // Passing user to next middleware
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
