const express = require('express');
const session = require('express-session');
const path = require('path');

const authRoutes = require('./routes/auth');
const mainRoutes = require('./routes/main');
const workoutRoutes = require('./routes/workouts');
const goalRoutes = require('./routes/goals');

const app = express();


app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));



// aessions
app.use(session({
  secret: 'pulsepro_secret_key',
  resave: false,
  saveUninitialized: false
}));

// flahs
app.use((req, res, next) => {
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  res.locals.currentUser = req.session.user;
  next();
});

// View engine
app.set('view engine', 'ejs');

//routes
app.use('/', mainRoutes);
app.use('/', authRoutes);
app.use('/workouts', workoutRoutes);
app.use('/goals', goalRoutes);


// 404
app.use((req, res) => {
  res.status(404).render('404', { title: "404" });
});

// Server
app.listen(8000, () => {
  console.log('PulsePro running on http://localhost:8000');
});
