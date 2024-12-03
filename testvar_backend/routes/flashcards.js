const express = require('express');
const router = express.Router();
const db = require('../models/flashcards'); // Ensure the correct path to the database model

// Get all flashcards along with their set names
router.get('/', (req, res) => {
  const query = `
    SELECT flashcards.id, flashcards.question, flashcards.answer, sets.name AS set_name 
    FROM flashcards
    LEFT JOIN sets ON flashcards.set_id = sets.id
  `;
  db.all(query, (err, rows) => {
    if (err) {
      return res.status(500).send({ error: err.message });
    }
    res.json(rows);
  });
}); 

// Add a new flashcard
router.post('/', (req, res) => {
  const { question, answer, set_id } = req.body;

  if (!question || !answer) {
    return res.status(400).send({ error: 'Both question and answer are required.' });
  }

  db.run(
    'INSERT INTO flashcards (question, answer, set_id) VALUES (?, ?, ?)',
    [question, answer, set_id || null], // Allow null if set_id is not provided
    function (err) {
      if (err) {
        return res.status(500).send({ error: err.message });
      }

      res.json({
        id: this.lastID,
        question,
        answer,
        set_id,
      });
    }
  );
});

// Delete a flashcard by ID
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  // Validate the ID parameter
  if (!id) {
    return res.status(400).send({ error: 'ID parameter is required.' });
  }

  // Delete the flashcard from the database
  db.run('DELETE FROM flashcards WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).send({ error: err.message }); // Send error message if deletion fails
    }

    if (this.changes === 0) {
      // No rows were affected, meaning the ID does not exist
      return res.status(404).send({ error: 'Flashcard not found.' });
    }

    // Confirm successful deletion
    res.json({ message: 'Flashcard deleted successfully.', id });
  });
});

module.exports = router;
