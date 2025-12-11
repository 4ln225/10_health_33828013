const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { ensureLoggedIn } = require('./middleware');

// gets list and chart
router.get('/', ensureLoggedIn, async (req, res) => {
  try {
    const userId = req.session.user.id;

    // full list
    const [workouts] = await pool.query(
      "SELECT * FROM workouts WHERE user_id = ? ORDER BY workout_date DESC",
      [userId]
    );

    // cgart data
    const [chartRows] = await pool.query(
      `SELECT workout_type, COUNT(*) AS count
       FROM workouts 
       WHERE user_id = ?
       GROUP BY workout_type`,
      [userId]
    );

    const labels = chartRows.map(r => r.workout_type);
    const values = chartRows.map(r => r.count);

    res.render('workouts_list', {
      title: "My Workouts",
      workouts,
      labels,
      values
    });

  } catch (err) {
    console.error(err);
    req.session.flash = { type: "error", message: "Unable to load workouts." };
    res.redirect('/');
  }
});

// GET: Add workout form
router.get('/add', ensureLoggedIn, (req, res) => {
  res.render('workouts_add', { title: "Add Workout" });
});

// POST: Add workout
router.post('/add', ensureLoggedIn, async (req, res) => {
  const { workout_date, workout_type, duration_minutes, intensity, notes } = req.body;

  try {
    await pool.query(
      `INSERT INTO workouts 
       (user_id, workout_date, workout_type, duration_minutes, intensity, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.session.user.id,
        workout_date,
        workout_type,
        duration_minutes,
        intensity,
        notes || null
      ]
    );

    req.session.flash = { type: "success", message: "Workout added!" };
    res.redirect('/workouts');

  } catch (err) {
    console.error(err);
    req.session.flash = { type: "error", message: "Error adding workout." };
    res.redirect('/workouts/add');
  }
});

// edit workout
router.get('/edit/:id', ensureLoggedIn, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM workouts WHERE id = ? AND user_id = ?",
      [req.params.id, req.session.user.id]
    );

    if (rows.length === 0) {
      req.session.flash = { type: "error", message: "Workout not found." };
      return res.redirect('/workouts');
    }

    res.render('workouts_edit', {
      title: "Edit Workout",
      workout: rows[0]
    });

  } catch (err) {
    console.error(err);
    res.redirect('/workouts');
  }
});

// save edited workout
router.post('/edit/:id', ensureLoggedIn, async (req, res) => {
  const { workout_date, workout_type, duration_minutes, intensity, notes } = req.body;

  try {
    await pool.query(
      `UPDATE workouts 
       SET workout_date = ?, workout_type = ?, duration_minutes = ?, intensity = ?, notes = ?
       WHERE id = ? AND user_id = ?`,
      [
        workout_date,
        workout_type,
        duration_minutes,
        intensity,
        notes,
        req.params.id,
        req.session.user.id
      ]
    );

    req.session.flash = { type: "success", message: "Workout updated!" };
    res.redirect('/workouts');

  } catch (err) {
    console.error(err);
    req.session.flash = { type: "error", message: "Update failed." };
    res.redirect('/workouts');
  }
});

// elete workout
router.post('/delete/:id', ensureLoggedIn, async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM workouts WHERE id = ? AND user_id = ?",
      [req.params.id, req.session.user.id]
    );

    req.session.flash = { type: "success", message: "Workout deleted." };
    res.redirect('/workouts');

  } catch (err) {
    console.error(err);
    req.session.flash = { type: "error", message: "Delete failed." };
    res.redirect('/workouts');
  }
});

// search for workout
router.get('/search', ensureLoggedIn, (req, res) => {
  res.render('workouts_search', { title: "Search Workouts", results: null });
});

router.post('/search', ensureLoggedIn, async (req, res) => {
  const { keyword, workout_type, start_date, end_date } = req.body;

  let sql = "SELECT * FROM workouts WHERE user_id = ?";
  let params = [req.session.user.id];

  if (keyword) { sql += " AND notes LIKE ?"; params.push('%' + keyword + '%'); }
  if (workout_type && workout_type !== "any") { sql += " AND workout_type = ?"; params.push(workout_type); }
  if (start_date) { sql += " AND workout_date >= ?"; params.push(start_date); }
  if (end_date) { sql += " AND workout_date <= ?"; params.push(end_date); }

  sql += " ORDER BY workout_date DESC";

  try {
    const [rows] = await pool.query(sql, params);
    res.render('workouts_search', { title: "Search Workouts", results: rows });
  } catch (err) {
    console.error(err);
    req.session.flash = { type: "error", message: "Search failed." };
    res.redirect('/workouts/search');
  }
});

module.exports = router;


