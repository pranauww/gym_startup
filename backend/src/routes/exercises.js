const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all exercises
router.get('/', auth, async (req, res) => {
  try {
    const exercises = await pool.query(
      'SELECT * FROM exercises ORDER BY name'
    );

    res.json(exercises.rows);
  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get exercise by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const exercise = await pool.query(
      'SELECT * FROM exercises WHERE id = $1',
      [req.params.id]
    );

    if (exercise.rows.length === 0) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    res.json(exercise.rows[0]);
  } catch (error) {
    console.error('Get exercise error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new exercise (admin only - for now, allow all authenticated users)
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Exercise name is required' });
    }

    // Check if exercise already exists
    const existingExercise = await pool.query(
      'SELECT * FROM exercises WHERE LOWER(name) = LOWER($1)',
      [name.trim()]
    );

    if (existingExercise.rows.length > 0) {
      return res.status(400).json({ message: 'Exercise already exists' });
    }

    const newExercise = await pool.query(
      'INSERT INTO exercises (name, description) VALUES ($1, $2) RETURNING *',
      [name.trim(), description || null]
    );

    res.status(201).json({
      message: 'Exercise created successfully',
      exercise: newExercise.rows[0]
    });
  } catch (error) {
    console.error('Create exercise error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search exercises
router.get('/search/:query', auth, async (req, res) => {
  try {
    const { query } = req.params;
    
    if (!query || query.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const exercises = await pool.query(
      'SELECT * FROM exercises WHERE name ILIKE $1 ORDER BY name LIMIT 10',
      [`%${query}%`]
    );

    res.json(exercises.rows);
  } catch (error) {
    console.error('Search exercises error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 