const express = require('express');
const router = express.Router();
const db = require('../models/flashcards');

// Get All Flashcards
router.get('/flashcards', (req, res) => {
    db.all('SELECT * FROM flashcards', (err, rows) => {
        if (err) return res.status(500).send(err.message);
        res.json(rows);
    });
});

// Add a Flashcard
router.post('/flashcards', (req, res) => {
    const { question, answer } = req.body;
    db.run('INSERT INTO flashcards (question, answer) VALUES (?, ?)', [question, answer], function (err) {
        if (err) return res.status(500).send(err.message);
        res.json({ id: this.lastID });
    });
});

module.exports = router;
