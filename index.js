require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Helper: pick random from array or weighted
function randomChoice(arr, weights) {
  if (!arr.length) return null;
  if (!weights) return arr[Math.floor(Math.random() * arr.length)];
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < arr.length; i++) {
    r -= weights[i];
    if (r < 0) return arr[i];
  }
  return arr[0];
}

// Cosmic placeholder (expand later)
function getCosmicTag() {
  const hr = new Date().getHours();
  return hr >= 18 || hr < 5 ? 'night' : 'day';
}

// Mood data with expanded fields
const moodData = {
  anxious: {
    next: ['calm', 'centered'],
    music: ['37i9dQZF1DX3Ogo9pFvBkY'], // lofi hip hop
    food: ['chamomile tea', 'warm milk'],
    mantra: ['You are safe. You are loved.'],
    breathwork: ['4-7-8 breathing: inhale 4s, hold 7s, exhale 8s'],
    activity: ['light stretching', 'short walk outside']
  },
  calm: {
    next: ['centered', 'energized'],
    music: ['37i9dQZF1DX4WYpdgoIcn6'], // chill hits
    food: ['green tea', 'cucumber slices'],
    mantra: ['I breathe in peace, exhale tension.'],
    breathwork: ['box breathing: inhale 4s, hold 4s, exhale 4s, hold 4s'],
    activity: ['meditation', 'journaling']
  },
  sad: {
    next: ['uplifted', 'happy'],
    music: ['37i9dQZF1DX3rxVfibe1L0'], // happy beats
    food: ['dark chocolate', 'berries'],
    mantra: ['Joy finds me now.'],
    breathwork: ['deep belly breaths: slow and steady'],
    activity: ['calling a friend', 'creative drawing']
  },
  tired: {
    next: ['energized', 'calm'],
    music: ['37i9dQZF1DX1s9knjP51Oa'], // ambient focus
    food: ['orange slices', 'water'],
    mantra: ['Today is full of potential.'],
    breathwork: ['alternate nostril breathing'],
    activity: ['power nap', 'gentle yoga']
  },
  angry: {
    next: ['balanced', 'calm'],
    music: ['37i9dQZF1DX4WYpdgoIcn6'], // chill hits
    food: ['cool water', 'mint leaves'],
    mantra: ['I breathe out tension.'],
    breathwork: ['slow exhales with hand on belly'],
    activity: ['punching pillow', 'boxing shadowboxing']
  },
  bored: {
    next: ['curious', 'energized'],
    music: ['37i9dQZF1DWYBO1MoTDhZI'], // ambient
    food: ['peppermint gum', 'carrot sticks'],
    mantra: ['Wonder is everywhere.'],
    breathwork: ['mindful breathing with counting'],
    activity: ['reading a new book', 'brainstorming ideas']
  },
  happy: {
    next: ['radiant', 'joyful'],
    music: ['37i9dQZF1DXdPec7aLTmlC'], // upbeat pop
    food: ['strawberries', 'fresh juice'],
    mantra: ['Let this love ripple out.'],
    breathwork: ['light fast breaths for energy'],
    activity: ['dancing', 'singing aloud']
  },
  overwhelmed: {
    next: ['centered', 'calm'],
    music: ['37i9dQZF1DWU0ScTcjJBdj'], // relaxing spa
    food: ['lavender tea', 'nuts'],
    mantra: ['One breath at a time.'],
    breathwork: ['progressive muscle relaxation'],
    activity: ['slow walk', 'list making']
  },
  centered: {
    next: ['energized', 'calm'],
    music: ['37i9dQZF1DX4WYpdgoIcn6'],
    food: ['water', 'fruit salad'],
    mantra: ['Be here now.'],
    breathwork: ['steady breathing'],
    activity: ['mindful observation', 'gentle stretches']
  },
  energized: {
    next: ['joyful', 'radiant'],
    music: ['37i9dQZF1DX1s9knjP51Oa'],
    food: ['banana', 'smoothie'],
    mantra: ['I am ready for today.'],
    breathwork: ['quick breaths to boost energy'],
    activity: ['jumping jacks', 'sun salutations']
  },
  joyful: {
    next: ['radiant', 'happy'],
    music: ['37i9dQZF1DXdPec7aLTmlC'],
    food: ['mango', 'coconut water'],
    mantra: ['Joy fills every cell.'],
    breathwork: ['deep joyful sighs'],
    activity: ['laughing', 'playing a game']
  },
  radiant: {
    next: ['joyful', 'happy'],
    music: ['37i9dQZF1DXdPec7aLTmlC'],
    food: ['pineapple', 'herbal tea'],
    mantra: ['I shine bright and free.'],
    breathwork: ['energizing breath cycles'],
    activity: ['creative expression', 'sunbathing']
  },
  curious: {
    next: ['energized', 'happy'],
    music: ['37i9dQZF1DWYBO1MoTDhZI'],
    food: ['trail mix', 'fresh fruit'],
    mantra: ['Every moment is a new discovery.'],
    breathwork: ['focused inhalations'],
    activity: ['learning something new', 'exploring outside']
  },
};

// Helper: blend arrays from multiple moods, de-dupe
function blendProps(moodList, prop) {
  const combined = moodList.flatMap(m => (moodData[m] && moodData[m][prop]) || []);
  // unique
  return [...new Set(combined)];
}

app.get('/', (_, res) => res.send('Live backend with mood combos and breathwork!'));

app.post('/shift', (req, res) => {
  let { mood = '', user = 'friend' } = req.body;
  mood = mood.toLowerCase().trim();

  // Support combo moods separated by commas
  const moods = mood.split(',').map(m => m.trim()).filter(m => moodData[m]);

  if (moods.length === 0) {
    // default if none match
    moods.push('overwhelmed');
  }

  // Blend all properties
  const nextMoodCandidates = blendProps(moods, 'next');
  const musicChoices = blendProps(moods, 'music');
  const foodChoices = blendProps(moods, 'food');
  const mantraChoices = blendProps(moods, 'mantra');
  const breathworkChoices = blendProps(moods, 'breathwork');
  const activityChoices = blendProps(moods, 'activity');

  // Randomly pick one from blended lists
  const nextMood = randomChoice(nextMoodCandidates);
  const music = randomChoice(musicChoices);
  const food = randomChoice(foodChoices);
  const mantra = randomChoice(mantraChoices);
  const breathwork = randomChoice(breathworkChoices);
  const activity = randomChoice(activityChoices);

  // Cosmic tag for future dynamic influence
  const cosmicTag = getCosmicTag();

  res.json({
    user,
    currentMood: moods.join(','),
    nextMood,
    music: `https://open.spotify.com/playlist/${music}`,
    food,
    mantra,
    breathwork,
    activity,
    cosmicTag
  });
});

app.get("/cosmic-today", (req, res) => {
  // For now, a simple static message
  res.json({ cosmicTag: "Today’s energy feels calm and grounded." });
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
