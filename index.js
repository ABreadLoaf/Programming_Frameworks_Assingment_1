const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const flashcardRoutes = require('./testvar_backend/routes/flashcards'); // Flashcard routes
const setRoutes = require('./testvar_backend/routes/sets'); // Set routes

const app = express();
const PORT = 3001; // The port your server will run on

// Middleware
app.use(cors());  // Enable CORS for all routes
app.use(bodyParser.json());  // Parse JSON request bodies

// API Routes
app.use('/api/flashcards', flashcardRoutes);  // Mount the flashcard routes at "/api/flashcards"
app.use('/api/sets', setRoutes);  // Mount the set routes at "/api/sets"

// Start the Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
