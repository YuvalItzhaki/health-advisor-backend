const express = require('express');
const router = express.Router();
const HealthData = require('../models/healthData'); 
const { authenticateUser } = require('../middlewares/authMiddleware');
const passport = require('passport');
const axios = require('axios');
const mongoose = require('mongoose');




router.post('/setup', async (req, res) => {
  const { userId, googleId, weights, heights, age, gender } = req.body;

  try {
      // If neither userId nor googleId is provided, respond with an error
      if (!userId && !googleId) {
          return res.status(400).json({ message: "User ID or Google ID is required." });
      }

      // Create health data record, either for userId or googleId
      const healthData = new HealthData({
          userId: userId || undefined,  // Store userId if present, otherwise null
          googleId: googleId || undefined,  // Store googleId if present, otherwise null
          weights,
          heights,
          age,
          gender
      });

      // Save the health data to the database
      await healthData.save();
      
      console.log('Saved healthData:', healthData);
      res.status(201).json(healthData);
  } catch (err) {
      console.error('Error saving health data:', err);
      res.status(500).json({ message: err.message });
  }
});



  router.get('/data', authenticateUser, async (req, res) => {
    const { userId } = req.query; // Get userId from query parameters
    console.log('bbbbbbbbb')

    try {
        const healthData = await HealthData.findOne({ userId }); // Fetch a single user's health data
        res.cookie('googleId', req.user.googleId, { httpOnly: false, secure: true, sameSite: 'Lax', path: '/' });

        res.json(healthData);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// router.post('/weight', async (req, res) => {
//     const { userId, weight } = req.body;
    
//     try {
//       const healthData = new HealthData({ userId, weight });
//       await healthData.save();
//       res.status(201).json(healthData);
//     } catch (err) {
//       res.status(500).json({ message: err.message });
//     }
//   });

router.get('/weights/:userId', async (req, res) => {
    const { userId } = req.params;
    console.log('trying to get weights')
    
    try {
        const healthData = await HealthData.find({ userId });
        res.json(healthData);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
//New rout :

router.get('/data/:id', async (req, res) => {
  const { id } = req.params;
  console.log('fffffffffff')
  
  try {
    let query;
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { userId: id }; // If it's a valid ObjectId, assume it's a userId
    } else {
      query = { googleId: id }; // Otherwise, treat it as a googleId
    }

    const healthData = await HealthData.findOne(query);

    if (!healthData) {
      return res.status(404).json({ message: 'Health data not found' });
    }

    res.json(healthData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Ensure your backend is handling this route properly
router.get('/google/:googleId', async (req, res) => {
  const googleId = req.params.googleId;
  try {
    const healthData = await HealthData.findOne({ googleId });
    if (!healthData) {
      return res.status(404).json({ message: 'Health data not found for this Google ID' });
    }
    res.json(healthData);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Example route for fetching Google Fit data
// router.get('/google-fit-data', passport.authenticate('session'), async (req, res) => {
//   try {
//     // Check if user is authenticated and has accessToken
//     console.log('User object for google-fit-data:', req.user);
//     if (!req.user || !req.user.accessToken) {
//       return res.status(401).json({ message: 'Unauthorized: No access token' });
//     }

//     const accessToken = req.user.accessToken;
//     const response = await axios.get('https://www.googleapis.com/fitness/v1/users/me/dataSources', {
//       headers: {
//         'Authorization': `Bearer ${accessToken}` // Corrected the template literal
//       },
//       params: {
//         "aggregateBy": [{
//           "dataTypeName": "com.google.step_count.delta"
//         }],
//         "bucketByTime": { "durationMillis": 86400000 },
//         "startTimeMillis": new Date('2024-01-01').getTime(),
//         "endTimeMillis": new Date().getTime()
//       }
//     });

//     res.json(response.data);
//   } catch (error) {
//     console.error('Error fetching Google Fit data:', error);
//     res.status(500).send('Error fetching Google Fit data');
//   }
// });

// router.get('/get-access-token', passport.authenticate('session'), async (req, res) => {
//   try {

//     if (!req.user) {
//       console.error('No user found in request');
//       return res.status(401).json({ message: 'Unauthorized: No user in session' });
//     }

//     if (!req.user.accessToken) {
//       console.error('No access token found for user');
//       return res.status(401).json({ message: 'Unauthorized: No access token' });
//     }

//     res.json({ accessToken: req.user.accessToken });
//   } catch (error) {
//     console.error('Error retrieving access token:', error);
//     res.status(500).json({ message: 'Error retrieving access token' });
//   }
// });


router.get('/:userType/:id', authenticateUser, async (req, res) => {
  const { userType, id } = req.params; // userType can be 'google' or 'user'
  console.log('i am hereeeee')

  try {
    let healthData;
    
    if (userType === 'google') {
      // Fetch health data based on googleId
      healthData = await HealthData.findOne({ googleId: id });
    } else if (userType === 'user') {
      // Fetch health data based on regular userId
      healthData = await HealthData.findOne({ userId: id });
    } else {
      return res.status(400).json({ message: 'Invalid user type' });
    }

    if (!healthData) {
      return res.status(404).json({ message: `Health data not found for ${userType} with ID ${id}` });
    }

    res.json(healthData);
  } catch (error) {
    console.error('Error fetching health data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Update weights or heights
router.put('/update/:dataType/:id', async (req, res) => {
  const { id, dataType } = req.params; // dataType can be 'heights' or 'weights'
  const { value } = req.body; // 'value' represents the new height or weight

  try {
    if (dataType !== 'heights' && dataType !== 'weights') {
      return res.status(400).json({ message: 'Invalid dataType specified' });
    }

    let query;
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { userId: id };
    } else {
      query = { googleId: id };
    }

    // Use $push to add the new value to the specified array field
    const update = { $push: { [dataType]: value } };

    console.log('Updating with query:', query, 'and update:', update);

    const updatedData = await HealthData.findOneAndUpdate(
      query, 
      update, 
      { new: true } // Return the updated document
    );

    if (!updatedData) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Updated data:', updatedData);
    res.status(200).json(updatedData);
  } catch (error) {
    console.error(`Error updating ${dataType}:`, error);
    res.status(500).json({ message: `Error updating ${dataType}`, error: error.message });
  }
});


  // route to update both weight and height
router.put('/:userId', async (req, res) => {
    const { userId } = req.params;
    const { weights, heights } = req.body;
    console.log('userId is: ', userId)
  
    try {
      const updatedHealthData = await HealthData.findByIdAndUpdate(
        userId,
        { $push: { weights: weights } }, // Add new weight to the array
        { $push: { heights: heights } },
        { new: true } // Return the updated document
      );
      console.log('updatedHealthData', updatedHealthData)
      
      if (!updatedHealthData) {
        return res.status(404).json({ message: 'Health data not found' });
      }
  
      res.json({
        weights: updatedHealthData.weights || [], // Assuming you store an array of weights
        heights: updatedHealthData.heights || [], // Assuming you store an array of heights
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  router.delete('/weight/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      await HealthData.findByIdAndDelete(id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });


router.get('/heights/:userId', async (req, res) => {
    const { userId } = req.params;
    
    try {
        const healthData = await HealthData.find({ userId });
        res.json(healthData);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.put('/heights/:userId', async (req, res) => {
  const { userId } = req.params;
  const { heights } = req.body;

  try {
    const updatedData = await HealthData.findOneAndUpdate(
      { userId },
      { $push: { heights: heights } }, // Add new height to the array
      { new: true } // Return the updated document
    );
    res.status(200).json(updatedData);
  } catch (error) {
    res.status(500).json({ message: 'Error updating height' });
  }
});

  router.delete('/height/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      await HealthData.findByIdAndDelete(id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  module.exports = router;

  