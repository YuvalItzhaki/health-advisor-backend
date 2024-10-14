require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const healthRouter = require('./routes/health');
const userRoutes = require('./routes/user');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('./config/passport');
const googleFitRoutes = require('./routes/googleFit');

const app = express();

connectDB();
const allowedOrigins = ['http://localhost:5173']; // Add all allowed origins here

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Allow requests with no origin (like mobile apps)
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true // Allows cookies to be sent
}));

// Session (required for Passport)
app.use(session({
  secret: process.env.GOOGLE_CLIENT_SECRET || 'your_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS

}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/health', healthRouter);
app.use('/api/users', userRoutes);
app.use('/api/googleFit', googleFitRoutes);

app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "script-src 'self' https://apis.google.com; object-src 'none'");
  res.removeHeader('Cross-Origin-Opener-Policy');
  res.removeHeader('Cross-Origin-Embedder-Policy');
  next();
});

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
