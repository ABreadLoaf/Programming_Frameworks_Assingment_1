// src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [flashcards, setFlashcards] = useState([]);
  const [newFlashcard, setNewFlashcard] = useState({ question: '', answer: '' });

  // Fetch flashcards on initial load
  useEffect(() => {
    axios.get('http://localhost:3001/api/flashcards')  // Update with your backend URL
      .then(response => setFlashcards(response.data))
      .catch(error => console.error('Error fetching flashcards:', error));
  }, []);

  // Handle form input changes
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewFlashcard((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle form submission (POST request to create a new flashcard)
  const handleSubmit = (event) => {
    event.preventDefault();
    axios.post('http://localhost:3001/api/flashcards', newFlashcard)  // Update with your backend URL
      .then(response => {
        setFlashcards([...flashcards, response.data.flashcard]);
        setNewFlashcard({ question: '', answer: '' });
      })
      .catch(error => console.error('Error creating flashcard:', error));
  };

  return (
    <div className="App container mt-5">
      <h1 className="text-center mb-4">Flashcards</h1>

      {/* Form to create a new flashcard */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Add a New Flashcard</h5>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="question" className="form-label">Question</label>
              <input
                type="text"
                name="question"
                id="question"
                className="form-control"
                value={newFlashcard.question}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="answer" className="form-label">Answer</label>
              <input
                type="text"
                name="answer"
                id="answer"
                className="form-control"
                value={newFlashcard.answer}
                onChange={handleInputChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">Add Flashcard</button>
          </form>
        </div>
      </div>

      {/* Display flashcards */}
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Existing Flashcards</h5>
          <ul className="list-group">
            {flashcards.map((flashcard, index) => (
              <li key={index} className="list-group-item">
                <strong>Question:</strong> {flashcard.question}
                <br />
                <strong>Answer:</strong> {flashcard.answer}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
