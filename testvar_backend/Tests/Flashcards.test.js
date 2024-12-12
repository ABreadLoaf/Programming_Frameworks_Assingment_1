const express = require('express');
const request = require('supertest'); // Make sure to import supertest
const flashcardRoutes = require('../routes/flashcards'); 
const sqlite3 = require('sqlite3').verbose();

// Setup Express app and mock database
const app = express();
app.use(express.json()); 
app.use('/flashcards', flashcardRoutes); // Use flashcard routes

// Create an in-memory database and initialize tables
const db = new sqlite3.Database(':memory:');

// Initialize tables for the test database
beforeAll((done) => {
  db.serialize(() => {
    db.run('CREATE TABLE sets (id INTEGER PRIMARY KEY, name TEXT)');
    db.run('CREATE TABLE flashcards (id INTEGER PRIMARY KEY, question TEXT, answer TEXT, set_id INTEGER, FOREIGN KEY (set_id) REFERENCES sets(id))');

    // Insert some test data into the 'sets' table
    const stmt = db.prepare('INSERT INTO sets (name) VALUES (?)');
    stmt.run('Basic Set');
    stmt.finalize();

    // Insert a flashcard into the 'flashcards' table
    const stmt2 = db.prepare('INSERT INTO flashcards (question, answer, set_id) VALUES (?, ?, ?)');
    stmt2.run('What is 2 + 2?', '4', 1);
    stmt2.finalize();

    done();
  });
});

// Close the database after tests are done
afterAll(() => {
  db.close();
});

describe('Flashcards API', () => {

  // Test GET route
  describe('GET /flashcards', () => {
    it('should return all flashcards along with their set names', async () => {
      const res = await request(app).get('/flashcards');
      
      expect(res.status).toBe(200); 
      expect(Array.isArray(res.body)).toBe(true); 
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('id');
        expect(res.body[0]).toHaveProperty('question');
        expect(res.body[0]).toHaveProperty('answer');
        expect(res.body[0]).toHaveProperty('set_name'); 
      }
    });
  });

  // Test POST route
  describe('POST /flashcards', () => {
    it('should create a new flashcard and return it', async () => {
      const newFlashcard = {
        question: "What is the capital of France?",
        answer: "Paris",
        set_id: 1, 
      };

      const res = await request(app)
        .post('/flashcards')
        .send(newFlashcard);

      expect(res.status).toBe(200); 
      expect(res.body).toHaveProperty('id'); 
      expect(res.body.question).toBe(newFlashcard.question);
      expect(res.body.answer).toBe(newFlashcard.answer);
      expect(res.body.set_id).toBe(newFlashcard.set_id);
    });

    it('should return an error if question or answer is missing', async () => {
      const incompleteFlashcard = {
        question: "What is the capital of France?",
      };

      const res = await request(app)
        .post('/flashcards')
        .send(incompleteFlashcard);

      expect(res.status).toBe(400); 
      expect(res.body.error).toBe('Both question and answer are required.');
    });
  });

  // Test DELETE route
  describe('DELETE /flashcards/:id', () => {
    it('should delete a flashcard by ID and return a success message', async () => {
     
      const newFlashcard = {
        question: "What is 2 + 2?",
        answer: "4",
        set_id: 1,
      };

      const createRes = await request(app)
        .post('/flashcards')
        .send(newFlashcard);

      const flashcardId = createRes.body.id;

      
      const deleteRes = await request(app)
        .delete(`/flashcards/${flashcardId}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.message).toBe('Flashcard deleted successfully.');
      expect(deleteRes.body.id).toBe(flashcardId); 
    });
  });
});
