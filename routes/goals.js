const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { ensureLoggedIn } = require('./middleware');

// goals list
router.get('/', ensureLoggedIn, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC",
      [req.session.user.id]
    );

    res.render('goals_list', {
      title: "My Goals",
      goals: rows
    });
  } catch (err) {
    console.error("GOALS ERROR:", err);
    res.status(500).send("Internal Server Error");
  }
});

// add goal form
router.get('/add', ensureLoggedIn, (req, res) => {
  res.render('goals_add', { title: "Add Goal" });
});

// save goal
router.post('/add', ensureLoggedIn, async (req, res) => {
  const { title, target_value, unit, period } = req.body;

  await pool.query(
    "INSERT INTO goals (user_id, title, target_value, unit, period) VALUES (?, ?, ?, ?, ?)",
    [req.session.user.id, title, target_value, unit, period]
  );

  res.redirect('/goals');
});

module.exports = router;

