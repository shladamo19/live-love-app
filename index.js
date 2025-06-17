// index.js  — Live‑Shift Engine v2
require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

/* ---------- helper utilities ---------- */

// pick a random item; accepts an optional weight array
function randomChoice(arr, weights) {
  if (!weights) return arr[Math.floor(Math.random() * arr.length)];
  const total = weights.reduce((a, b) => a + b, 0);
  const r = Math.random() * total;
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += weights[i];
    if (r < sum) return arr[i];
  }
  return arr[0];
}

// simple cosmic stub (expand later with real APIs)
function getCosmicTag() {
  const hr = new Date().getHours();
  return hr >= 18 || hr < 5 ? 'night' : 'day';
}

/* ---------- core data ---------- */

const moodMap = {
  anxious:   { next: 'calm',       music: ['37i9dQZF1DX3Ogo9pFvBkY'],        food: ['chamomile tea'],           mantra: ['You are safe. You are loved.'] },
  sad:       { next: 'uplifted',   music: ['37i9dQZF1DX3rxVfibe1L0'],        food: ['dark chocolate'],          mantra: ['Joy finds me now.'] },
  tired:     { next: 'energized',  music: ['37i9dQZF1DX1s9knjP51Oa'],        food: ['orange slices'],           mantra: ['Today is full of potential.'] },
  angry:     { next: 'balanced',   music: ['37i9dQZF1DX4WYpdgoIcn6'],        food: ['cool water'],             mantra: ['I breathe out tension.'] },
  bored:     { next: 'curious',    music: ['37i9dQZF1DWYBO1MoTDhZI'],        food: ['peppermint gum'],          mantra: ['Wonder is everywhere.'] },
  happy:     { next: 'radiant',    music: ['37i9dQZF1DXdPec7aLTmlC'],        food: ['strawberries'],            mantra: ['Let this love ripple out.'] },
  overwhelmed:{next:'centered',    music: ['37i9dQZF1DWU0ScTcjJBdj'],        food: ['lavender tea'],            mantra: ['One breath at a time.'] }
};

// weight choices (more relaxing tracks at night, etc.)
const nightWeights = { calm: 2, balanced: 2, uplifted: 1, energized: 1 };

/* ---------- routes ---------- */

// root
app.get('/', (_, res) => res.send('Live backend up — v2!'));

// POST /shift
app.post('/shift', (req, res) => {
  const { mood = '', user = 'friend' } = req.body;
  const key = mood.toLowerCase();
  const base = moodMap[key] || moodMap['overwhelmed'];   // fallback

  // time‑of‑day / cosmic tweak
  const cosmic = getCosmicTag();      // "day" or "night"
  const isNight = cosmic === 'night';

  // weighted next mood (calmer at night)
  const nextMoodPool = Object.values(moodMap).map(v => v.next);
  const nextWeights  = nextMoodPool.map(n => (isNight ? (nightWeights[n] || 1) : 1));
  const nextMoo
