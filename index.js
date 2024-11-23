const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const flashcardRoutes = require('./testvar_backend/routes/flashcards'); // Import routes

const app = express();
const PORT = 3001; // Choose the port for your server

// Middleware
app.use(cors());
app.use(bodyParser.json()); // Parse JSON request bodies

// API Routes
app.use('/api', flashcardRoutes);

// Start the Server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));