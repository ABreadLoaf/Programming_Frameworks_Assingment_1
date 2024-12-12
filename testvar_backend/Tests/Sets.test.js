const express = require('express');
const request = require('supertest');
const setRoutes = require('../routes/sets'); // Assuming you have routes for sets
const sqlite3 = require('sqlite3').verbose();

// Setup Express app and mock database
const app = express();
app.use(express.json()); // Middleware to parse JSON
app.use('/sets', setRoutes); // Use set routes

// Create an in-memory database and initialize tables
const db = new sqlite3.Database(':memory:');

// Initialize tables for the test database
beforeAll((done) => {
  db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS sets (id INTEGER PRIMARY KEY, name TEXT)');
    db.run('CREATE TABLE IF NOT EXISTS flashcards (id INTEGER PRIMARY KEY, question TEXT, answer TEXT, set_id INTEGER, FOREIGN KEY (set_id) REFERENCES sets(id))');
    
    // Insert some test data into the 'sets' table
    const stmt = db.prepare('INSERT INTO sets (name) VALUES (?)');
    stmt.run('Basic Set');
    stmt.finalize();

    done();
  });
});

// Close the database after tests are done
afterAll(() => {
  db.close();
});

describe('Sets API', () => {

  // Test GET route
  describe('GET /sets', () => {
    it('should return all sets', async () => {
      const res = await request(app).get('/sets');
      
      expect(res.status).toBe(200); // Expect a 200 OK response
      expect(Array.isArray(res.body)).toBe(true); // Expect response body to be an array
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('id');
        expect(res.body[0]).toHaveProperty('name');
      }
    });
  });

  // Test POST route
  describe('POST /sets', () => {
    it('should create a new set and return it', async () => {
      const newSet = {
        name: 'New Set', // The name for the set
      };

      const res = await request(app)
        .post('/sets')
        .send(newSet);

      expect(res.status).toBe(201); // Expect 201 Created for a successful creation
      expect(res.body).toHaveProperty('id'); // Check that the response includes an ID
      expect(res.body.name).toBe(newSet.name); // Ensure the name matches
    });

    it('should return an error if name is missing', async () => {
      const incompleteSet = {}; // Missing name

      const res = await request(app)
        .post('/sets')
        .send(incompleteSet);

      expect(res.status).toBe(400); // Expect 400 Bad Request
      expect(res.body.error).toBe('Set name is required.');
    });
  });

  // Test DELETE route
  describe('DELETE /sets/:id', () => {
    it('should delete a set by ID and return a success message', async () => {
      // First, add a set to ensure that there's one to delete
      const newSet = {
        name: 'Set to delete',
      };

      const createRes = await request(app)
        .post('/sets')
        .send(newSet);

      const setId = createRes.body.id;

      // Now, try to delete that set
      const deleteRes = await request(app)
        .delete(`/sets/${setId}`);

      expect(deleteRes.status).toBe(200); // Expect 200 OK response
      expect(deleteRes.body.message).toBe('Set and associated flashcards deleted successfully.');
      expect(Number(deleteRes.body.id)).toBe(setId); // Ensure the correct ID is returned (convert to number)
    });
  });
});
