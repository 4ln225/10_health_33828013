const express = require('express');
const session = require('express-session');
const path = require('path');
const mysqlStore = require('express-mysql-session')(session);
require('dotenv').config();

const mainRoutes = require('./routes/main');
const authRoutes = require('./routes/auth');
const workoutRoutes = require('./routes/workouts');
const goalsRoutes = require('./routes/goals');

// Create app
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sessions
const sessionStore = new mysqlStore({
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

app.use(
    session({
        secret: 'pulseprosecret',
        resave: false,
        saveUninitialized: false,
        store: sessionStore
    })
);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', mainRoutes);
app.use('/', authRoutes);
app.use('/workouts', workoutRoutes);
app.use('/goals', goalsRoutes);

// Start server on VM-specific WWW port
const PORT = 8398;
app.listen(PORT, () => {
    console.log(`PulsePro running on: http://localhost:${PORT}`);
});

