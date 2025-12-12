const express = require('express');
const pool = require('../config/db');
const { ensureLoggedIn } = require('./middleware');

const router = express.Router();

// LIST + CHART
router.get('/', ensureLoggedIn, async (req, res) => {
  const userId = req.session.user.id;

  const [workouts] = await pool.query(
    "SELECT * FROM workouts WHERE user_id = ? ORDER BY workout_date DESC",
    [userId]
  );

  const [chart] = await pool.query(
    "SELECT workout_type, COUNT(*) count FROM workouts WHERE user_id = ? GROUP BY workout_type",
    [userId]
  );

  res.render('workouts_list', {
    title: "My Workouts",
    workouts,
    labels: chart.map(c => c.workout_type),
    values: chart.map(c => c.count)
  });
});

// ADD FORM
router.get('/add', ensureLoggedIn, (req, res) => {
  res.render('workouts_add', { title: "Add Workout" });
});

// ADD SUBMIT
router.post('/add', ensureLoggedIn, async (req, res) => {
  const { workout_date, workout_type, duration_minutes, intensity, notes } = req.body;

  await pool.query(
    `INSERT INTO workouts (user_id, workout_date, workout_type, duration_minutes, intensity, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [req.session.user.id, workout_date, workout_type, duration_minutes, intensity, notes || null]
  );

  res.redirect('/workouts');
});

// EDIT FORM
router.get('/edit/:id', ensureLoggedIn, async (req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM workouts WHERE id = ? AND user_id = ?",
    [req.params.id, req.session.user.id]
  );

  res.render('workouts_add', {
    title: "Edit Workout",
    workout: rows[0]
  });
});

// EDIT SUBMIT
router.post('/edit/:id', ensureLoggedIn, async (req, res) => {
  const { workout_date, workout_type, duration_minutes, intensity, notes } = req.body;

  await pool.query(
    `UPDATE workouts SET workout_date=?, workout_type=?, duration_minutes=?, intensity=?, notes=?
     WHERE id=? AND user_id=?`,
    [workout_date, workout_type, duration_minutes, intensity, notes, req.params.id, req.session.user.id]
  );

  res.redirect('/workouts');
});

// DELETE
router.post('/delete/:id', ensureLoggedIn, async (req, res) => {
  await pool.query(
    "DELETE FROM workouts WHERE id=? AND user_id=?",
    [req.params.id, req.session.user.id]
  );

  res.redirect('/workouts');
});

module.exports = router;



