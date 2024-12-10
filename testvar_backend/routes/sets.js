const express = require('express');
const router = express.Router();
const db = require('../models/flashcards');

// Get all sets
router.get('/', (req, res) => { 
    db.all('SELECT * FROM sets', (err, rows) => {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        res.json(rows);
    });
});

// Add a new set
router.post('/', (req, res) => {  
    const { name } = req.body;
    
    // Check if name is provided
    if (!name) {
        return res.status(400).json({ error: 'Set name is required' });
    }
  
    // Insert the set into the database
    const query = `INSERT INTO sets (name) VALUES (?)`;
    db.run(query, [name], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, name });
    });
});

// Delete a set by ID
router.delete('/:id', (req, res) => {  
    const { id } = req.params;
  
// Delete flashcards associated with the set
db.run('DELETE FROM flashcards WHERE set_id = ?', [id], function (err) {
    if (err) {
        return res.status(500).send({ error: err.message });
    }

    // Now delete the set itself
    db.run('DELETE FROM sets WHERE id = ?', [id], function (err) {
        if (err) {
            return res.status(500).send({ error: err.message });
        }

        if (this.changes === 0) {
            return res.status(404).send({ error: 'Set not found.' });
        }

        res.json({ message: 'Set and associated flashcards deleted successfully.', id });
    });
});

});

module.exports = router;
