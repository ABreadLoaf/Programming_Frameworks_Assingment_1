const express = require('express');
const request = require('supertest');
const userRoutes = require('../routes/users'); // Adjust the path to your users route
const sqlite3 = require('sqlite3').verbose();

// Setup Express app and mock database
const app = express();
app.use(express.json()); // Middleware to parse JSON
app.use('/users', userRoutes); // Use user routes

// Create an in-memory database and initialize tables
const db = new sqlite3.Database(':memory:');

// Initialize tables for the test database
beforeAll((done) => {
  db.serialize(() => {
    db.run('CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT)');
    db.run('CREATE TABLE flashcards (id INTEGER PRIMARY KEY, question TEXT, answer TEXT, set_id INTEGER, FOREIGN KEY (set_id) REFERENCES sets(id))');
    done();
  });
});

// Clean up users table before each test to avoid conflicts
beforeEach((done) => {
  db.run('DELETE FROM users', done);
});

// Close the database after tests are done
afterAll(() => {
  db.close();
});

describe('Users API', () => {

  describe('POST /users/signup', () => {
    it('should create a new user and return it', async () => {
      const newUser = {
        username: 'newUser',  // Ensure this is unique for each test run
        password: 'password123',  // Ensure password is provided
      };

      const res = await request(app)
        .post('/users/signup')
        .send(newUser);

      expect(res.status).toBe(201); // Expect 201 Created for a successful user creation
      expect(res.body).toHaveProperty('id'); // Check that the response includes an ID
      expect(res.body.username).toBe(newUser.username); // Ensure the username matches
    });

    it('should return an error if username already exists', async () => {
      // First, create a user to ensure the username exists
      const existingUser = {
        username: 'existingUser',
        password: 'password123',
      };

      await request(app).post('/users/signup').send(existingUser);

      const res = await request(app)
        .post('/users/signup')
        .send(existingUser); // Attempt to create the same user again

      expect(res.status).toBe(400); // Expect 400 Bad Request
      expect(res.body.error).toBe('Username already exists');
    });
  });

  describe('POST /users/login', () => {
    it('should log in and return a token', async () => {
      const newUser = {
        username: 'newUser',
        password: 'password123',
      };

      // First, sign up the user
      await request(app).post('/users/signup').send(newUser);

      const res = await request(app)
        .post('/users/login')
        .send(newUser);

      expect(res.status).toBe(200); // Expect 200 OK response
      expect(res.body).toHaveProperty('token'); // Ensure token is present
    });

    it('should return an error for invalid credentials', async () => {
      const invalidUser = {
        username: 'nonExistentUser',
        password: 'wrongPassword',
      };

      const res = await request(app)
        .post('/users/login')
        .send(invalidUser);

      expect(res.status).toBe(400); // Expect 400 Bad Request
      expect(res.body.error).toBe('Invalid username or password');
    });
  });

  describe('GET /users/me', () => {
    it('should return user details when a valid token is provided', async () => {
      const newUser = {
        username: 'newUser',
        password: 'password123',
      };

      // First, sign up and log in to get a token
      await request(app).post('/users/signup').send(newUser);
      const loginRes = await request(app).post('/users/login').send(newUser);

      const token = loginRes.body.token;

      const res = await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200); // Expect 200 OK response
      expect(res.body).toHaveProperty('username');
      expect(res.body.username).toBe(newUser.username);
    });

    it('should return an error if token is missing or invalid', async () => {
      const res = await request(app).get('/users/me'); // No token provided

      expect(res.status).toBe(401); // Expect 401 Unauthorized
      expect(res.body.error).toBe('Access Denied');
    });
  });

});
