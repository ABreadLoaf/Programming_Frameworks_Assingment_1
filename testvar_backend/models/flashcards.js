const sqlite3 = require('sqlite3').verbose(); // Import SQLite
const db = new sqlite3.Database('./testvar_backend/db/database.db'); // Connect to the database

// Create flashcards table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS flashcards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    set_id INTEGER,
    FOREIGN KEY (set_id) REFERENCES sets(id)
  );
`, (err) => {
  if (err) {
    console.error('Error creating flashcards table:', err);
  } else {
    console.log('Flashcards table ready!');
  }
});

// Create sets table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS sets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  );
`, (err) => {
  if (err) {
    console.error('Error creating sets table:', err);
  } else {
    console.log('Sets table ready!');
  }
});

module.exports = db;
