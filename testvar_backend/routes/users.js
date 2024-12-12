const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models/flashcards'); // Adjust the path to your SQLite database
const router = express.Router();

// Middleware to authenticate token
function authenticateToken(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1]; // Get token from 'Authorization' header
  if (!token) return res.status(401).json({ error: 'Access Denied' });

  jwt.verify(token, process.env.JWT_SECRET || 'default_secret', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid Token' });
    req.user = user;  // Attach user info to request
    next();  // Proceed to next middleware/handler
  });
}

// Signup route
router.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  // Ensure both username and password are provided
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `INSERT INTO users (username, password) VALUES (?, ?)`;
    db.run(query, [username, hashedPassword], function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint')) {
          return res.status(400).json({ error: 'Username already exists' });
        }
        return res.status(500).json({ error: 'Failed to create user' });
      }

      res.status(201).json({ id: this.lastID, username });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// Login route
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const query = `SELECT * FROM users WHERE username = ?`;

  db.get(query, [username], async (err, user) => {
    if (err) {
      console.error(err);  // Log the error for debugging
      return res.status(500).json({ error: 'Database error during login' });
    }

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1h' }
    );

    res.json({
      user: { id: user.id, username: user.username },
      token
    });
  });
});

// Get user details (authenticated)
router.get('/me', authenticateToken, (req, res) => {
  const query = `SELECT id, username FROM users WHERE id = ?`;

  db.get(query, [req.user.id], (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error during fetching user' });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  });
});

module.exports = router;
