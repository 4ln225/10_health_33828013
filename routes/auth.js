const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../config/db');

const router = express.Router();

// login form
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});


router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const [rows] = await pool.query(
    'SELECT * FROM users WHERE username = ?',
    [username]
  );

  if (rows.length === 0) {
    req.session.flash = { type: 'error', message: 'Invalid username or password.' };
    return res.redirect('/usr/398/login');
  }

  const user = rows[0];
  const match = await bcrypt.compare(password, user.password_hash);

  if (!match) {
    req.session.flash = { type: 'error', message: 'Invalid username or password.' };
    return res.redirect('/usr/398/login');
  }

  req.session.user = { id: user.id, username: user.username };
  res.redirect('/usr/398/workouts');
});

// regsiter form
router.get('/register', (req, res) => {
  res.render('register', { title: 'Register' });
});


router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);

  try {
    await pool.query(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)',
      [username, hash]
    );

    req.session.flash = { type: 'success', message: 'Account created. Please log in.' };
    res.redirect('/usr/398/login');
  } catch {
    req.session.flash = { type: 'error', message: 'Username already exists.' };
    res.redirect('/usr/398/register');
  }
});

// logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/usr/398/login');
  });
});

module.exports = router;



