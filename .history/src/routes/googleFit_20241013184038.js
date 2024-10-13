const express = require('express');
const { google } = require('googleapis');
const fitness = google.fitness('v1');
const passport = require('passport');
const HealthData = require('../models/healthData'); 
const { authenticateUser } = require('../middlewares/authMiddleware');


const router = express.Router();

// router.get('/steps', async (req, res) => {
//     console.log('i am in steps route!!!!')
//   try {
//     const auth = new google.auth.OAuth2();
//     auth.setCredentials({ access_token: req.headers.authorization });

//     const startTimeMillis = new Date('2024-10-01T00:00:00Z').getTime();
//     const endTimeMillis = new Date('2024-10-09T23:59:59Z').getTime();

//     const response = await fitness.users.dataSources.datasets.get({
//       auth,
//       userId: 'me',
//       dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:merge_step_deltas',
//       datasetId: `${startTimeMillis}000000-${endTimeMillis}000000`,
//     });

//     const stepsArray = response.data.point.map(point => ({
//       steps: point.value[0].intVal,
//       startTime: point.startTimeNanos,
//       endTime: point.endTimeNanos,
//     }));

//     res.json(stepsArray);
//   } catch (err) {
//     console.error('Error fetching step data:', err);
//     res.status(500).send('Error fetching step data');
//   }
// });
router.get('/get-access-token', passport.authenticate('session'), async (req, res) => {
  try {

    if (!req.user) {
      console.error('No user found in request');
      return res.status(401).json({ message: 'Unauthorized: No user in session' });
    }

    if (!req.user.accessToken) {
      console.error('No access token found for user');
      return res.status(401).json({ message: 'Unauthorized: No access token' });
    }

    res.json({ accessToken: req.user.accessToken });
  } catch (error) {
    console.error('Error retrieving access token:', error);
    res.status(500).json({ message: 'Error retrieving access token' });
  }
});

module.exports = router;
