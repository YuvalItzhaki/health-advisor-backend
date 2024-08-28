const express = require('express');
const router = express.Router();
const HealthData = require('../models/healthData'); 

router.post('/weight', async (req, res) => {
    const { userId, weight } = req.body;
  
    try {
      const healthData = await HealthData.create({ userId, weight });
      res.status(201).json(healthData);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  router.get('/weight/:userId', async (req, res) => {
    const { userId } = req.params;
  
    try {
      const healthData = await HealthData.find({ userId });
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

  router.delete('/weight/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      await HealthData.findByIdAndDelete(id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  module.exports = router;

  