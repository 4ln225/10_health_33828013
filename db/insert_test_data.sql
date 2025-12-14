INSERT INTO users (username, password_hash)
VALUES ('gold', '$2b$10$u9tXaj1FqGV8ho99j/BmveUL5ny3Vx9gq8k8spcB7GxeF3e0mra7e');

-- sample workouts 
INSERT INTO workouts (user_id, workout_date, workout_type, duration_minutes, intensity, notes) VALUES
(1, '2025-01-05', 'Run', 20, 'medium', 'Morning chest day'),
(1, '2025-01-08', 'Gym', 45, 'high', 'Chest day in gym'),
(1, '2025-01-10', 'Yoga', 30, 'low', 'Daily stretches session');

