-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exercises
CREATE TABLE exercises (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT
);

-- Workouts
CREATE TABLE workouts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_volume INTEGER,
  total_time INTEGER
);

-- Workout Sets
CREATE TABLE workout_sets (
  id SERIAL PRIMARY KEY,
  workout_id INTEGER REFERENCES workouts(id),
  exercise_id INTEGER REFERENCES exercises(id),
  reps INTEGER,
  weight INTEGER,
  form_score INTEGER,
  video_url TEXT
);

-- Comments
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  workout_id INTEGER REFERENCES workouts(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Social (Followers)
CREATE TABLE followers (
  user_id INTEGER REFERENCES users(id),
  follower_id INTEGER REFERENCES users(id),
  PRIMARY KEY (user_id, follower_id)
);

-- Competitions
CREATE TABLE competitions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  start_date DATE,
  end_date DATE
);

-- Competition Entries
CREATE TABLE competition_entries (
  id SERIAL PRIMARY KEY,
  competition_id INTEGER REFERENCES competitions(id),
  user_id INTEGER REFERENCES users(id),
  value INTEGER
); 