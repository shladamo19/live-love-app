// index.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// ===== Schemas =====

// User schema - store user info, zodiac, biometrics, etc.
const UserSchema = new mongoose.Schema({
  name: String,
  birthdate: Date,
  zodiacSign: String,
  biometrics: {
    heartRate: Number,
    sleepHours: Number,
    // add more as needed
  },
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model('User', UserSchema);

// Mood schema - user mood and combo moods
const MoodSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  mood: String,
  comboMoods: [String],
  timestamp: { type: Date, default: Date.now },
});
const Mood = mongoose.model('Mood', MoodSchema);

// Recommendation schema - music, food, activities, breath work
const RecommendationSchema = new mongoose.Schema({
  moods: [String], // moods this recommendation applies to
  music: [String], // song titles or URLs (Spotify, Apple Music)
  food: [String],
  activities: [String],
  breathWork: [String], // descriptions or links
});
const Recommendation = mongoose.model('Recommendation', RecommendationSchema);

// Article schema - science, spirituality, quantum physics
const ArticleSchema = new mongoose.Schema({
  category: String, // 'science', 'spirituality', 'quantum'
  title: String,
  url: String,
});
const Article = mongoose.model('Article', ArticleSchema);

// ===== Sample Data Seeder (run once or via separate script) =====
async function seedData() {
  const count = await Recommendation.countDocuments();
  if (count === 0) {
    await Recommendation.insertMany([
      {
        moods: ['anxious', 'stressed'],
        music: ['Calm Vibes Playlist - Spotify', 'Relaxing Piano - Apple Music'],
        food: ['Drink water', 'Eat light snacks like nuts or fruit'],
        activities: ['Breath work exercises (see /breathwork)', 'Get sunlight', 'Take a short walk'],
        breathWork: ['4-7-8 breathing technique', 'Box breathing'],
      },
      {
        moods: ['happy', 'energetic'],
        music: ['Upbeat Pop Hits - Spotify', 'Feel Good Mix - Apple Music'],
        food: ['Eat protein-rich foods', 'Hydrate well'],
        activities: ['Dance or move your body', 'Socialize with friends', 'Start a hobby'],
        breathWork: ['Energizing breath sequences'],
      },
      // Add more mood combos here
    ]);
    console.log('Seeded Recommendations');
  }

  const articleCount = await Article.countDocuments();
  if (articleCount === 0) {
    await Article.insertMany([
      { category: 'science', title: 'How Energy Affects Reality', url: 'https://example.com/science-energy' },
      { category: 'spirituality', title: 'Harnessing Love and Good Vibes', url: 'https://example.com/spirituality-love' },
      { category: 'quantum', title: 'Quantum Physics and Consciousness', url: 'https://example.com/quantum-consciousness' },
    ]);
    console.log('Seeded Articles');
  }
}
// Run seeder once when server starts
seedData().catch(console.error);

// ===== Routes =====

// Get mood recommendations for a given mood or combo moods
app.get('/api/recommendations', async (req, res) => {
  try {
    const { mood, combo } = req.query; // mood=anxious&combo=stressed,calm
    let moodsToMatch = [];

    if (mood) moodsToMatch.push(mood.toLowerCase());
    if (combo) moodsToMatch = moodsToMatch.concat(combo.toLowerCase().split(','));

    // Find recommendations matching any of these moods
    const recs = await Recommendation.find({
      moods: { $in: moodsToMatch }
    });

    if (recs.length === 0) {
      return res.json({ message: 'No recommendations found for these moods.' });
    }

    // Combine all matched recommendations
    const combined = {
      music: [],
      food: [],
      activities: [],
      breathWork: []
    };
    recs.forEach(r => {
      combined.music.push(...r.music);
      combined.food.push(...r.food);
      combined.activities.push(...r.activities);
      combined.breathWork.push(...r.breathWork);
    });

    // Remove duplicates
    for (let key in combined) {
      combined[key] = [...new Set(combined[key])];
    }

    res.json({ moods: moodsToMatch, recommendations: combined });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get articles by category
app.get('/api/articles', async (req, res) => {
  try {
    const category = req.query.category?.toLowerCase();
    const filter = category ? { category } : {};
    const articles = await Article.find(filter);
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Breath work instructions endpoint
app.get('/api/breathwork', (req, res) => {
  res.json({
    breathWorkExercises: [
      { name: '4-7-8 Breathing', description: 'Inhale for 4 seconds, hold for 7, exhale for 8.' },
      { name: 'Box Breathing', description: 'Inhale 4s, hold 4s, exhale 4s, hold 4s.' },
      { name: 'Energizing Breath', description: 'Quick inhales and exhales for 30 seconds.' },
    ]
  });
});

// Add more routes as needed: user registration, zodiac calculation, biometrics input, Spotify playlist retrieval, etc.

// ===== Start server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
