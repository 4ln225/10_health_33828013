const express = require('express');
const session = require('express-session');
const path = require('path');
const workoutRoutes = require('./routes/workouts');
const goalRoutes = require('./routes/goals');

require('dotenv').config();

// import routes
const mainRoutes = require('./routes/main');
const authRoutes = require('./routes/auth');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));


app.use(
  session({
    secret: 'pulsepro-secret',
    resave: false,
    saveUninitialized: false
  })
);

// Flash , user injection middleware 
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.flash = req.session.flash || null;
  delete req.session.flash; // only 1 time
  next();
});

// register route files
app.use('/', mainRoutes);
app.use('/', authRoutes);
app.use('/workouts', workoutRoutes);
app.use('/goals', goalRoutes);



// 404 handler helps know what page aint wokrin
app.use((req, res) => {
  res.status(404).render('404', { title: "Not Found" });
});

// start server
const PORT = process.env.PORT || 58398;

app.listen(PORT, () => {
  console.log(`PulsePro running on http://localhost:${PORT}`);
});
