const express = require('express');
const { google } = require('googleapis');
const fitness = google.fitness('v1');

const router = express.Router();

router.get('/steps', async (req, res) => {
    console.log('i am in steps route!!!!')
  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: req.headers.authorization });

    const startTimeMillis = new Date('2024-10-01T00:00:00Z').getTime();
    const endTimeMillis = new Date('2024-10-09T23:59:59Z').getTime();

    const response = await fitness.users.dataSources.datasets.get({
      auth,
      userId: 'me',
      dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:merge_step_deltas',
      datasetId: `${startTimeMillis}000000-${endTimeMillis}000000`,
    });

    const stepsArray = response.data.point.map(point => ({
      steps: point.value[0].intVal,
      startTime: point.startTimeNanos,
      endTime: point.endTimeNanos,
    }));

    res.json(stepsArray);
  } catch (err) {
    console.error('Error fetching step data:', err);
    res.status(500).send('Error fetching step data');
  }
});

module.exports = router;
