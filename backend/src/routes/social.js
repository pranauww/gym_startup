const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Follow a user
router.post('/follow/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    // Check if user exists
    const userExists = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [userId]
    );

    if (userExists.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already following
    const alreadyFollowing = await pool.query(
      'SELECT * FROM followers WHERE user_id = $1 AND follower_id = $2',
      [userId, req.user.id]
    );

    if (alreadyFollowing.rows.length > 0) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Follow user
    await pool.query(
      'INSERT INTO followers (user_id, follower_id) VALUES ($1, $2)',
      [userId, req.user.id]
    );

    res.json({ message: 'User followed successfully' });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unfollow a user
router.delete('/follow/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      'DELETE FROM followers WHERE user_id = $1 AND follower_id = $2',
      [userId, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ message: 'Not following this user' });
    }

    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get social feed (workouts from followed users)
router.get('/feed', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const feed = await pool.query(
      `SELECT w.*, u.username, u.id as user_id,
              COUNT(ws.id) as set_count,
              SUM(ws.reps * COALESCE(ws.weight, 0)) as total_volume
       FROM workouts w
       JOIN users u ON w.user_id = u.id
       LEFT JOIN workout_sets ws ON w.id = ws.workout_id
       WHERE w.user_id IN (
         SELECT user_id FROM followers WHERE follower_id = $1
       ) OR w.user_id = $1
       GROUP BY w.id, u.username, u.id
       ORDER BY w.performed_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    // Get total count for pagination
    const totalCount = await pool.query(
      `SELECT COUNT(DISTINCT w.id) 
       FROM workouts w
       WHERE w.user_id IN (
         SELECT user_id FROM followers WHERE follower_id = $1
       ) OR w.user_id = $1`,
      [req.user.id]
    );

    res.json({
      feed: feed.rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(totalCount.rows[0].count / limit),
        total_posts: parseInt(totalCount.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to workout
router.post('/workouts/:workoutId/comments', auth, async (req, res) => {
  try {
    const { workoutId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    // Check if workout exists
    const workout = await pool.query(
      'SELECT * FROM workouts WHERE id = $1',
      [workoutId]
    );

    if (workout.rows.length === 0) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    // Add comment
    const newComment = await pool.query(
      'INSERT INTO comments (user_id, workout_id, content) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, workoutId, content.trim()]
    );

    // Get comment with user info
    const commentWithUser = await pool.query(
      `SELECT c.*, u.username 
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = $1`,
      [newComment.rows[0].id]
    );

    res.status(201).json({
      message: 'Comment added successfully',
      comment: commentWithUser.rows[0]
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get comments for a workout
router.get('/workouts/:workoutId/comments', auth, async (req, res) => {
  try {
    const { workoutId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const comments = await pool.query(
      `SELECT c.*, u.username 
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.workout_id = $1
       ORDER BY c.created_at DESC
       LIMIT $2 OFFSET $3`,
      [workoutId, limit, offset]
    );

    // Get total count for pagination
    const totalCount = await pool.query(
      'SELECT COUNT(*) FROM comments WHERE workout_id = $1',
      [workoutId]
    );

    res.json({
      comments: comments.rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(totalCount.rows[0].count / limit),
        total_comments: parseInt(totalCount.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get followers list
router.get('/followers', auth, async (req, res) => {
  try {
    const followers = await pool.query(
      `SELECT u.id, u.username, u.created_at
       FROM followers f
       JOIN users u ON f.follower_id = u.id
       WHERE f.user_id = $1
       ORDER BY f.follower_id DESC`,
      [req.user.id]
    );

    res.json(followers.rows);
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get following list
router.get('/following', auth, async (req, res) => {
  try {
    const following = await pool.query(
      `SELECT u.id, u.username, u.created_at
       FROM followers f
       JOIN users u ON f.user_id = u.id
       WHERE f.follower_id = $1
       ORDER BY f.user_id DESC`,
      [req.user.id]
    );

    res.json(following.rows);
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create competition
router.post('/competitions', auth, async (req, res) => {
  try {
    const { name, start_date, end_date } = req.body;

    if (!name || !start_date || !end_date) {
      return res.status(400).json({ message: 'Name, start_date, and end_date are required' });
    }

    const newCompetition = await pool.query(
      'INSERT INTO competitions (name, start_date, end_date) VALUES ($1, $2, $3) RETURNING *',
      [name, start_date, end_date]
    );

    res.status(201).json({
      message: 'Competition created successfully',
      competition: newCompetition.rows[0]
    });
  } catch (error) {
    console.error('Create competition error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get active competitions
router.get('/competitions', auth, async (req, res) => {
  try {
    const competitions = await pool.query(
      'SELECT * FROM competitions WHERE end_date >= NOW() ORDER BY start_date DESC'
    );

    res.json(competitions.rows);
  } catch (error) {
    console.error('Get competitions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit competition entry
router.post('/competitions/:competitionId/entries', auth, async (req, res) => {
  try {
    const { competitionId } = req.params;
    const { value } = req.body;

    if (!value || value <= 0) {
      return res.status(400).json({ message: 'Valid value is required' });
    }

    // Check if competition exists and is active
    const competition = await pool.query(
      'SELECT * FROM competitions WHERE id = $1 AND end_date >= NOW()',
      [competitionId]
    );

    if (competition.rows.length === 0) {
      return res.status(404).json({ message: 'Competition not found or ended' });
    }

    // Check if user already has an entry
    const existingEntry = await pool.query(
      'SELECT * FROM competition_entries WHERE competition_id = $1 AND user_id = $2',
      [competitionId, req.user.id]
    );

    if (existingEntry.rows.length > 0) {
      return res.status(400).json({ message: 'Already submitted an entry for this competition' });
    }

    // Add entry
    const newEntry = await pool.query(
      'INSERT INTO competition_entries (competition_id, user_id, value) VALUES ($1, $2, $3) RETURNING *',
      [competitionId, req.user.id, value]
    );

    res.status(201).json({
      message: 'Competition entry submitted successfully',
      entry: newEntry.rows[0]
    });
  } catch (error) {
    console.error('Submit competition entry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get competition leaderboard
router.get('/competitions/:competitionId/leaderboard', auth, async (req, res) => {
  try {
    const { competitionId } = req.params;

    const leaderboard = await pool.query(
      `SELECT ce.*, u.username
       FROM competition_entries ce
       JOIN users u ON ce.user_id = u.id
       WHERE ce.competition_id = $1
       ORDER BY ce.value DESC`,
      [competitionId]
    );

    res.json(leaderboard.rows);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 