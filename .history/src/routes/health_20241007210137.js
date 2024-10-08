const express = require('express');
const router = express.Router();
const HealthData = require('../models/healthData'); 
const { authenticateUser } = require('../middlewares/authMiddleware');


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

router.get('/google-fit-data', async (req, res) => {
  try {
    // Ensure user is authenticated
    console.log('req.user:', req.user)
    if (!req.user || !req.user.accessToken) {
      return res.status(401).json({ message: 'Unauthorized: No access token' });
    }

    const accessToken = req.user.accessToken;
    console.log('Using accessToken:', accessToken);

    const response = await axios.get('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      params: {
        "aggregateBy": [{
          "dataTypeName": "com.google.step_count.delta"
        }],
        "bucketByTime": { "durationMillis": 86400000 },
        "startTimeMillis": new Date('2024-01-01').getTime(),
        "endTimeMillis": new Date().getTime()
      }
    });

    // If successful, send the response data
    res.json(response.data);

  } catch (error) {
    // Log the full error to see the actual issue
    console.error('Error fetching Google Fit data:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Error fetching Google Fit data', error: error.message });
  }
});




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




// router.get('/googleId/:id', async (req, res) => {
//   const { googleId } = req.params;
  
//   try {
//       const healthData = await HealthData.find({ googleId });
//       res.json(healthData);
//   } catch (err) {
//       res.status(500).json({ message: err.message });
//   }
// });

// router.put('/weight/:userId', async (req, res) => {
//     const { userId } = req.params;
//     const { weight } = req.body;
  
//     try {
//       // Assuming userId is a field in the document, not the _id
//       const healthData = await HealthData.findOneAndUpdate({ userId }, { weight }, { new: true });
  
//       if (!healthData) {
//         return res.status(404).json({ message: 'Health data not found' });
//       }
  
//       res.json(healthData);
//     } catch (err) {
//       res.status(500).json({ message: err.message });
//     }
//   });
  
//   router.put('/weight/:id', async (req, res) => {
//     const { id } = req.params;
//     const { weight } = req.body;
    
//     try {
//       const healthData = await HealthData.findByIdAndUpdate(id, { weight }, { new: true });
//       res.json(healthData);
//     } catch (err) {
//       res.status(500).json({ message: err.message });
//     }
//   });
const mongoose = require('mongoose');

// PUT request for updating weights
router.put('/weights/:id', async (req, res) => {
  const { id } = req.params; // This can be either userId or googleId
  const { weights } = req.body;

  console.log('Received ID:', id);

  try {
    // Check if the id is a valid ObjectId
    let query;
    if (mongoose.Types.ObjectId.isValid(id)) {
      // If id is valid ObjectId, assume it's userId
      query = { userId: id };
    } else {
      // Otherwise, assume it's a googleId (string)
      query = { googleId: id };
    }

    console.log('Query:', JSON.stringify(query, null, 2));

    // Use $push to add the new weight to the weights array
    const updatedData = await HealthData.findOneAndUpdate(
      query, 
      { $push: { weights: weights } }, 
      { new: true } // Return the updated document
    );

    if (!updatedData) {
      console.log('No user found with this ID:', id);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Updated data:', updatedData);
    res.status(200).json(updatedData);
  } catch (error) {
    console.error('Error updating weight:', error);
    res.status(500).json({ message: 'Error updating weight', error: error.message });
  }
});




  // Backend route to update both weight and height
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

  //Height 
//   router.post('/height', async (req, res) => {
//     const { userId, height } = req.body;
    
//     try {
//       const healthData = new HealthData({ userId, height });
//       await healthData.save();
//       res.status(201).json(healthData);
//     } catch (err) {
//       res.status(500).json({ message: err.message });
//     }
//   });

router.get('/heights/:userId', async (req, res) => {
    const { userId } = req.params;
    
    try {
        const healthData = await HealthData.find({ userId });
        res.json(healthData);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// router.put('/height/:userId', async (req, res) => {
//     const { userId } = req.params;
//     const { height } = req.body;
  
//     try {
//       // Assuming userId is a field in the document, not the _id
//       const healthData = await HealthData.findOneAndUpdate({ userId }, { height }, { new: true });
  
//       if (!healthData) {
//         return res.status(404).json({ message: 'Health data not found' });
//       }
  
//       res.json(healthData);
//     } catch (err) {
//       res.status(500).json({ message: err.message });
//     }
//   });

//   router.put('/height/:id', async (req, res) => {
//     const { id } = req.params;
//     const { height } = req.body;
    
//     try {
//       const healthData = await HealthData.findByIdAndUpdate(id, { height }, { new: true });
//       res.json(healthData);
//     } catch (err) {
//       res.status(500).json({ message: err.message });
//     }
//   });

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

  