const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./testvar_backend/db/database.db');

// Create Table if it doesn't exist
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS flashcards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT NOT NULL,
            answer TEXT NOT NULL
        )
    `);
});

module.exports = db;
