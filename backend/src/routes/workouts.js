const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const { validate, workoutSchemas } = require('../middleware/validation');

const router = express.Router();

// Create new workout
router.post('/', auth, validate(workoutSchemas.create), async (req, res) => {
  try {
    const { total_volume, total_time } = req.body;
    
    const newWorkout = await pool.query(
      'INSERT INTO workouts (user_id, total_volume, total_time) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, total_volume || 0, total_time || 0]
    );

    res.status(201).json({
      message: 'Workout created successfully',
      workout: newWorkout.rows[0]
    });
  } catch (error) {
    console.error('Create workout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all workouts for current user
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const workouts = await pool.query(
      `SELECT w.*, 
              COUNT(ws.id) as set_count,
              SUM(ws.reps * COALESCE(ws.weight, 0)) as total_volume
       FROM workouts w
       LEFT JOIN workout_sets ws ON w.id = ws.workout_id
       WHERE w.user_id = $1
       GROUP BY w.id
       ORDER BY w.performed_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    // Get total count for pagination
    const totalCount = await pool.query(
      'SELECT COUNT(*) FROM workouts WHERE user_id = $1',
      [req.user.id]
    );

    res.json({
      workouts: workouts.rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(totalCount.rows[0].count / limit),
        total_workouts: parseInt(totalCount.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific workout with sets
router.get('/:id', auth, async (req, res) => {
  try {
    const workout = await pool.query(
      'SELECT * FROM workouts WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (workout.rows.length === 0) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    // Get workout sets with exercise details
    const sets = await pool.query(
      `SELECT ws.*, e.name as exercise_name, e.description as exercise_description
       FROM workout_sets ws
       JOIN exercises e ON ws.exercise_id = e.id
       WHERE ws.workout_id = $1
       ORDER BY ws.id`,
      [req.params.id]
    );

    res.json({
      workout: workout.rows[0],
      sets: sets.rows
    });
  } catch (error) {
    console.error('Get workout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add set to workout
router.post('/:id/sets', auth, validate(workoutSchemas.addSet), async (req, res) => {
  try {
    const { exercise_id, reps, weight, form_score, video_url } = req.body;
    const workoutId = req.params.id;

    // Verify workout belongs to user
    const workout = await pool.query(
      'SELECT * FROM workouts WHERE id = $1 AND user_id = $2',
      [workoutId, req.user.id]
    );

    if (workout.rows.length === 0) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    // Add the set
    const newSet = await pool.query(
      'INSERT INTO workout_sets (workout_id, exercise_id, reps, weight, form_score, video_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [workoutId, exercise_id, reps, weight || 0, form_score || null, video_url || null]
    );

    // Update workout total volume
    const totalVolume = await pool.query(
      'SELECT SUM(reps * COALESCE(weight, 0)) as total FROM workout_sets WHERE workout_id = $1',
      [workoutId]
    );

    await pool.query(
      'UPDATE workouts SET total_volume = $1 WHERE id = $2',
      [totalVolume.rows[0].total || 0, workoutId]
    );

    res.status(201).json({
      message: 'Set added successfully',
      set: newSet.rows[0]
    });
  } catch (error) {
    console.error('Add set error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update workout
router.put('/:id', auth, validate(workoutSchemas.create), async (req, res) => {
  try {
    const { total_volume, total_time } = req.body;
    const workoutId = req.params.id;

    // Verify workout belongs to user
    const workout = await pool.query(
      'SELECT * FROM workouts WHERE id = $1 AND user_id = $2',
      [workoutId, req.user.id]
    );

    if (workout.rows.length === 0) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    // Update workout
    const updatedWorkout = await pool.query(
      'UPDATE workouts SET total_volume = $1, total_time = $2 WHERE id = $3 RETURNING *',
      [total_volume || 0, total_time || 0, workoutId]
    );

    res.json({
      message: 'Workout updated successfully',
      workout: updatedWorkout.rows[0]
    });
  } catch (error) {
    console.error('Update workout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete workout
router.delete('/:id', auth, async (req, res) => {
  try {
    const workoutId = req.params.id;

    // Verify workout belongs to user
    const workout = await pool.query(
      'SELECT * FROM workouts WHERE id = $1 AND user_id = $2',
      [workoutId, req.user.id]
    );

    if (workout.rows.length === 0) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    // Delete workout sets first (due to foreign key constraint)
    await pool.query('DELETE FROM workout_sets WHERE workout_id = $1', [workoutId]);
    
    // Delete workout
    await pool.query('DELETE FROM workouts WHERE id = $1', [workoutId]);

    res.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error('Delete workout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get workout statistics
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    
    let dateFilter = '';
    let params = [req.user.id];
    
    switch (period) {
      case 'week':
        dateFilter = 'AND performed_at >= NOW() - INTERVAL \'7 days\'';
        break;
      case 'month':
        dateFilter = 'AND performed_at >= NOW() - INTERVAL \'30 days\'';
        break;
      case 'year':
        dateFilter = 'AND performed_at >= NOW() - INTERVAL \'1 year\'';
        break;
    }

    const stats = await pool.query(
      `SELECT 
        COUNT(*) as total_workouts,
        SUM(total_volume) as total_volume,
        SUM(total_time) as total_time,
        AVG(total_volume) as avg_volume_per_workout
       FROM workouts 
       WHERE user_id = $1 ${dateFilter}`,
      params
    );

    res.json(stats.rows[0]);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 