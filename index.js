const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (_, res) => res.send('Live backend up!'));

app.post('/shift', (req, res) => {
  const { mood } = req.body;

  let response = {
    nextMood: 'centered',
    music: 'https://open.spotify.com/playlist/37i9dQZF1DWYBO1MoTDhZI',
    food: 'water',
    mantra: 'Be here now.'
  };

  if (mood === 'anxious') {
    response = {
      nextMood: 'calm',
      music: 'https://open.spotify.com/playlist/37i9dQZF1DX3Ogo9pFvBkY',
      food: 'chamomile tea',
      mantra: 'You are safe. You are loved.'
    };
  }

  res.json(response);
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
