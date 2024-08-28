const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/auth');
require('dotenv').config();


// Connect to the database
connectDB();
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174']; // Add all allowed origins here

app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true // This allows cookies to be sent with requests
  }));
app.use(express.json());
app.use('/api/auth', authRoutes);

// // Connect to MongoDB
// mongoose.connect('mongodb://localhost:27017/health-advisor', { useNewUrlParser: true, useUnifiedTopology: true });

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
