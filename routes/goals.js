const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { ensureLoggedIn } = require('./middleware');

// goals list
router.get('/goals', ensureLoggedIn, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC",
      [req.session.user.id]
    );

    res.render('goals_list', { title: "My Goals", goals: rows });
  } catch (err) {
    console.error(err);
    req.session.flash = { type: "error", message: "Unable to load goals." };
    res.redirect('/');
  }
});

// add goal
router.get('/add', ensureLoggedIn, (req, res) => {
  res.render('goals_add', { title: "Add Goal" });
});

// save goal
router.post('/add', ensureLoggedIn, async (req, res) => {
  const { title, target_value, unit, period } = req.body;

  if (!title || !target_value || !unit || !period) {
    req.session.flash = { type: "error", message: "Please complete all fields." };
    return res.redirect('/goals/add');
  }

  try {
    await pool.query(
      "INSERT INTO goals (user_id, title, target_value, unit, period) VALUES (?, ?, ?, ?, ?)",
      [req.session.user.id, title, target_value, unit, period]
    );

    req.session.flash = { type: "success", message: "Goal added successfully!" };
    res.redirect('/goals');
  } catch (err) {
    console.error(err);
    req.session.flash = { type: "error", message: "Error saving goal." };
    res.redirect('/goals/add');
  }
});

module.exports = router;
