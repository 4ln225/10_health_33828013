CREATE DATABASE health;
USE health;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  password_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE workouts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  workout_date DATE,
  workout_type VARCHAR(50),
  duration_minutes INT,
  intensity VARCHAR(20),
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);


