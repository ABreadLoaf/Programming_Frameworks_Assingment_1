// flashcards.js

const express = require('express');
const router = express.Router();
const db = require('../models/flashcards'); // Ensure the correct path to the database model

// Get all flashcards
router.get('/', (req, res) => {
    db.all('SELECT * FROM flashcards', (err, rows) => {
        if (err) {
            return res.status(500).send({ error: err.message }); // Send error message if query fails
        }
        // Return all flashcards as JSON response
        res.json(rows);
    });
});

// Add a new flashcard
router.post('/', (req, res) => {
    const { question, answer } = req.body;
    
    // Validate request body
    if (!question || !answer) {
        return res.status(400).send({ error: 'Both question and answer are required.' });
    }

    // Insert new flashcard into the database
    db.run('INSERT INTO flashcards (question, answer) VALUES (?, ?)', [question, answer], function(err) {
        if (err) {
            return res.status(500).send({ error: err.message }); // Send error message if insertion fails
        }
        
        // Return the inserted flashcard with its ID
        res.json({
            id: this.lastID,  // the last inserted ID
            question,
            answer,
        });
    });
});

module.exports = router;
