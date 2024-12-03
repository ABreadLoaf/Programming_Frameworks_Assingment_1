import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [flashcards, setFlashcards] = useState([]);
  const [sets, setSets] = useState([]); // State for available sets
  const [newFlashcard, setNewFlashcard] = useState({ question: '', answer: '', set_id: '' });
  const [newSetName, setNewSetName] = useState(''); // State for the new set name
  const [selectedSet, setSelectedSet] = useState(''); // State for selected set

  // Fetch flashcards and sets on initial load
  useEffect(() => {
    fetchFlashcards();
    fetchSets();
  }, []);

  const fetchFlashcards = () => {
    axios.get('http://localhost:3001/api/flashcards')
      .then(response => {
        setFlashcards(response.data);
      })
      .catch(error => console.error('Error fetching flashcards:', error));
  };

  const fetchSets = () => {
    axios.get('http://localhost:3001/api/sets')
      .then(response => {
        setSets(response.data);
      })
      .catch(error => console.error('Error fetching sets:', error));
  };

  // Handle form input changes for flashcards
  const handleFlashcardInputChange = (event) => {
    const { name, value } = event.target;
    setNewFlashcard((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle form submission for flashcards
  const handleFlashcardSubmit = (event) => {
    event.preventDefault();
    axios.post('http://localhost:3001/api/flashcards', newFlashcard)
      .then(response => {
        const createdFlashcard = response.data;
  
        // Find the name of the set from the sets state
        const setName = sets.find(set => set.id === parseInt(createdFlashcard.set_id))?.name || '';
  
        // Add the flashcard with the set_name to the flashcards state
        setFlashcards(prevState => [...prevState, { ...createdFlashcard, set_name: setName }]);
  
        // Reset the form
        setNewFlashcard({ question: '', answer: '', set_id: '' });
      })
      .catch(error => console.error('Error creating flashcard:', error));
  };
  

  // Handle form submission for adding a new set
  const handleSetSubmit = (event) => {
    event.preventDefault();
    axios.post('http://localhost:3001/api/sets', { name: newSetName })
      .then(response => {
        setSets(prevState => [...prevState, response.data]); // Add new set to the list
        setNewSetName(''); // Reset the form
      })
      .catch(error => console.error('Error creating set:', error));
  };

  // Handle delete set request
  const deleteSet = (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this set?');
    if (confirmed) {
      axios.delete(`http://localhost:3001/api/sets/${id}`)
        .then(() => {
          // Force a refresh of the sets list
          fetchSets();
  
          // Reset selected set in the flashcard form if it's the deleted one
          setNewFlashcard((prevState) => ({
            ...prevState,
            set_id: prevState.set_id === id ? '' : prevState.set_id,
          }));
  
          // Reset selected set in the dropdown
          setSelectedSet('');
        })
        .catch((error) => {
          console.error('Error deleting set:', error);
        });
    }
  };

  // Delete a flashcard with confirmation
  const deleteFlashcard = (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this flashcard?');
    if (confirmed) {
      axios.delete(`http://localhost:3001/api/flashcards/${id}`)
        .then(() => {
          setFlashcards(prevState => prevState.filter(flashcard => flashcard.id !== id));
        })
        .catch(error => console.error('Error deleting flashcard:', error));
    }
  };

  return (
    <div className="App container mt-5">
      <h1 className="text-center mb-4">Flashcards</h1>

      {/* Form to create a new flashcard */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Add a New Flashcard</h5>
          <form onSubmit={handleFlashcardSubmit}>
            <div className="mb-3">
              <label htmlFor="question" className="form-label">Question</label>
              <input
                type="text"
                name="question"
                id="question"
                className="form-control"
                value={newFlashcard.question}
                onChange={handleFlashcardInputChange}
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
                onChange={handleFlashcardInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="set_id" className="form-label">Set</label>
              <select
                name="set_id"
                id="set_id"
                className="form-control"
                value={newFlashcard.set_id}
                onChange={handleFlashcardInputChange}
              >
                <option value="">Select a set</option>
                {sets.map((set) => (
                  <option key={set.id} value={set.id}>
                    {set.name}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-primary w-100">Add Flashcard</button>
          </form>
        </div>
      </div>

      {/* Form to create a new set */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Add a New Set</h5>
          <form onSubmit={handleSetSubmit}>
            <div className="mb-3">
              <label htmlFor="setName" className="form-label">Set Name</label>
              <input
                type="text"
                id="setName"
                className="form-control"
                value={newSetName}
                onChange={(e) => setNewSetName(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-secondary w-100">Add Set</button>
          </form>
        </div>
      </div>

      {/* Dropdown to select and delete a set */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Manage Sets</h5>
          <div className="mb-3">
            <label htmlFor="setSelect" className="form-label">Select a Set to Delete</label>
            <select
              id="setSelect"
              className="form-control"
              value={selectedSet}
              onChange={(e) => setSelectedSet(e.target.value)}
            >
              <option value="">Select a set</option>
              {sets.map((set) => (
                <option key={set.id} value={set.id}>
                  {set.name}
                </option>
              ))}
            </select>
          </div>
          <button
            className="btn btn-danger w-100"
            onClick={() => selectedSet && deleteSet(selectedSet)}
            disabled={!selectedSet}
          >
            Delete Set
          </button>
        </div>
      </div>

      {/* Display flashcards */}
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Existing Flashcards</h5>
          <ul className="list-group">
            {flashcards.length > 0 ? (
              flashcards.map((flashcard) => (
                <li key={flashcard.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Question:</strong> {flashcard.question}
                    <br />
                    <strong>Answer:</strong> {flashcard.answer}
                    {flashcard.set_name && (
                      <>
                        <br />
                        <strong>Set:</strong> {flashcard.set_name}
                      </>
                    )}
                  </div>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteFlashcard(flashcard.id)}
                  >
                    Delete
                  </button>
                </li>
              ))
            ) : (
              <li className="list-group-item">No flashcards available</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App; // Export the component
