const express = require('express');
const router = express.Router();
const flashcardModel = require('../models/flashcards'); // Import model

// GET: Fetch all flashcard sets
router.get('/flashcard-sets', async (req, res) => {
    try {
        const sets = await flashcardModel.getAllFlashcardSets(); // Fetch data from the database
        res.json(sets); // Send the result as JSON
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch flashcard sets' });
    }
});

module.exports = router; // Export the router
