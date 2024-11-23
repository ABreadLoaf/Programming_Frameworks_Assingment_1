const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/database.db');

module.exports = {
    getAllFlashcardSets: () => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM flashcard_sets', (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },
};
