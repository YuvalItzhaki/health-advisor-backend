const express = require('express');
const router = express.Router();
const HealthData = require('../models/healthData'); 

router.post('/setup', async (req, res) => {
    const { userId, weight, height, age, gender } = req.body;
    
    try {
      const healthData = new HealthData({ userId, weight, height, age, gender  });
      await healthData.save();
      res.status(201).json(healthData);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  router.get('/data', async (req, res) => {
    const { userId } = req.query; // Get userId from query parameters

    try {
        const healthData = await HealthData.findOne({ userId }); // Fetch a single user's health data
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

router.get('/weight/:userId', async (req, res) => {
    const { userId } = req.params;
    
    try {
        const healthData = await HealthData.find({ userId });
        res.json(healthData);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/weight/:userId', async (req, res) => {
    const { userId } = req.params;
    const { weight } = req.body;
  
    try {
      // Assuming userId is a field in the document, not the _id
      const healthData = await HealthData.findOneAndUpdate({ userId }, { weight }, { new: true });
  
      if (!healthData) {
        return res.status(404).json({ message: 'Health data not found' });
      }
  
      res.json(healthData);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  router.put('/weight/:id', async (req, res) => {
    const { id } = req.params;
    const { weight } = req.body;
    
    try {
      const healthData = await HealthData.findByIdAndUpdate(id, { weight }, { new: true });
      res.json(healthData);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Backend route to update both weight and height
router.put('/:userId', async (req, res) => {
    const { userId } = req.params;
    const { weight, height } = req.body;
    console.log('userId is: ', userId)
  
    try {
      const updatedHealthData = await HealthData.findByIdAndUpdate(
        userId,
        { weight, height },
        { new: true } // Return the updated document
      );
      
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

router.get('/height/:userId', async (req, res) => {
    const { userId } = req.params;
    
    try {
        const healthData = await HealthData.find({ userId });
        res.json(healthData);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/height/:userId', async (req, res) => {
    const { userId } = req.params;
    const { height } = req.body;
  
    try {
      // Assuming userId is a field in the document, not the _id
      const healthData = await HealthData.findOneAndUpdate({ userId }, { height }, { new: true });
  
      if (!healthData) {
        return res.status(404).json({ message: 'Health data not found' });
      }
  
      res.json(healthData);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  router.put('/height/:id', async (req, res) => {
    const { id } = req.params;
    const { height } = req.body;
    
    try {
      const healthData = await HealthData.findByIdAndUpdate(id, { height }, { new: true });
      res.json(healthData);
    } catch (err) {
      res.status(500).json({ message: err.message });
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

  