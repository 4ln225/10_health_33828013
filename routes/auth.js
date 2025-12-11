const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const router = express.Router();

// for login lil feature 
function flash(req, type, message) {
  req.session.flash = { type, message };
}

// register page
router.get('/register', (req, res) => {
  res.render('register', { title: "Register" });
});

// register user
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      flash(req, "error", "All fields are required.");
      return res.redirect('/register');
    }
  
    // passw validation (yes ik max 1 1 1 1 ...))
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  
    if (!passwordPattern.test(password)) {
      flash(req, "error", "Password must be at least 8 characters and include upper, lower, number and special character.");
      return res.redirect('/register');
    }
  
    try {
      const hash = await bcrypt.hash(password, 10);
  
      await pool.query(
        "INSERT INTO users (username, password_hash) VALUES (?, ?)",
        [username, hash]
      );
  
      flash(req, "success", "Registration successful. Please log in.");
      res.redirect('/login');
    } catch (err) {
      console.error(err);
      flash(req, "error", "Username already exists or an error occurred.");
      return res.redirect('/register');
    }
  });
  
// lgin page
router.get('/login', (req, res) => {
  res.render('login', { title: "Login" });
});


router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      flash(req, "error", "Invalid username or password.");
      return res.redirect('/login');
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      flash(req, "error", "Invalid username or password.");
      return res.redirect('/login');
    }

    // store in session
    req.session.user = {
      id: user.id,
      username: user.username
    };

    flash(req, "success", "Logged in successfully!");
    res.redirect('/');
  } catch (err) {
    console.error(err);
    flash(req, "error", "An error occurred. Please try again.");
    res.redirect('/login');
  }
});

// logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;

