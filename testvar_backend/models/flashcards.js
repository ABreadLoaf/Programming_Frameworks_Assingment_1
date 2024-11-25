// models/flashcards.js

const sqlite3 = require('sqlite3').verbose();  // Import SQLite
const db = new sqlite3.Database('./testvar_backend/db/database.db');  // Connect to the database

// Create flashcards table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS flashcards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL
  );
`, (err) => {
  if (err) {
    console.error('Error creating flashcards table:', err);
  } else {
    console.log('Flashcards table ready!');
  }
});

module.exports = db;
