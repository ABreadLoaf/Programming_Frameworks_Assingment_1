import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function App() {
  const [flashcards, setFlashcards] = useState([]);
  const [filteredFlashcards, setFilteredFlashcards] = useState([]);
  const [sets, setSets] = useState([]);
  const [newFlashcard, setNewFlashcard] = useState({ question: '', answer: '', set_id: '' });
  const [newSetName, setNewSetName] = useState('');
  const [selectedSet, setSelectedSet] = useState('');
  const [answersVisible, setAnswersVisible] = useState({});
  
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state
  const [loginData, setLoginData] = useState({ username: '', password: '' }); // Only username and password
  const [signupData, setSignupData] = useState({ username: '', password: '' });
  const [isSignup, setIsSignup] = useState(false); // Toggle between signup and login forms

  useEffect(() => {
    // Check login status from localStorage
    if (localStorage.getItem('authToken')) {
      setIsLoggedIn(true);
    }
  }, []);

  
  useEffect(() => {
    if (isLoggedIn) {
      fetchSets(); // Fetch sets first
    }
  }, [isLoggedIn]);

  const fetchFlashcards = useCallback(() => {
    console.log('Fetching flashcards...');
    axios.get('http://localhost:3001/api/flashcards')
        .then(response => {
            const flashcardsWithSetIds = response.data.map(flashcard => {
                const matchingSet = sets.find(set => set.name === flashcard.set_name);
                return {
                    ...flashcard,
                    set_id: matchingSet ? matchingSet.id : null, // Assign matching set ID or null
                };
            });

            setFlashcards(flashcardsWithSetIds);

            // Reapply the filter
            setFilteredFlashcards(flashcardsWithSetIds.filter(flashcard => 
                selectedSet === '' || flashcard.set_id === selectedSet
            ));

            console.log('Flashcards after processing:', flashcardsWithSetIds); // Log to verify
        })
        .catch(error => console.error('Error fetching flashcards:', error));
}, [sets, selectedSet]); // Add selectedSet as a dependency to reapply filter


  useEffect(() => {
    if (isLoggedIn && sets.length > 0) {
      fetchFlashcards(); // Fetch flashcards only after sets are loaded
    }
  }, [isLoggedIn, sets, fetchFlashcards]); // Add `fetchFlashcards` to dependencies
  
  const fetchSets = () => {
    axios.get('http://localhost:3001/api/sets')
      .then(response => {
        console.log('Fetched sets:', response.data); // Log fetched sets
        setSets(response.data);
      })
      .catch(error => console.error('Error fetching sets:', error));
  };
  

  const handleFlashcardInputChange = (event) => {
    const { name, value } = event.target;
    setNewFlashcard((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleFlashcardSubmit = (event) => {
    event.preventDefault();
    axios.post('http://localhost:3001/api/flashcards', newFlashcard)
        .then(response => {
            const createdFlashcard = response.data;
            const setName = sets.find(set => set.id === parseInt(createdFlashcard.set_id, 10))?.name || '';
            const flashcardWithSetName = { ...createdFlashcard, set_name: setName };
            console.log('Created flashcard:', flashcardWithSetName);

            // Update flashcards and filteredFlashcards correctly
            setFlashcards(prevState => {
                const updatedFlashcards = [...prevState, flashcardWithSetName];
                setFilteredFlashcards(updatedFlashcards.filter(flashcard => 
                    selectedSet === '' || flashcard.set_id === selectedSet // Apply filter based on selected set
                ));
                return updatedFlashcards;
            });

            setNewFlashcard({ question: '', answer: '', set_id: '' }); // Reset newFlashcard state
        })
        .catch(error => console.error('Error creating flashcard:', error));
};

  

  const handleSetSubmit = (event) => {
    event.preventDefault();
    axios.post('http://localhost:3001/api/sets', { name: newSetName })
      .then(response => {
        setSets(prevState => [...prevState, response.data]);
        setNewSetName('');
      })
      .catch(error => console.error('Error creating set:', error));
  };

  const handleSetFilterChange = (event) => {
    const selectedSetId = parseInt(event.target.value, 10) || ''; // Convert to integer or reset to ''
    setSelectedSet(selectedSetId);
  
    const newFilteredFlashcards = selectedSetId === ''
      ? flashcards
      : flashcards.filter(flashcard => flashcard.set_id === selectedSetId); // Compare against set_id
  
    setFilteredFlashcards(newFilteredFlashcards);
    console.log('Selected Set:', selectedSetId); // Debug log
    console.log('Filtered Flashcards:', newFilteredFlashcards); // Debug log
  };
  
  

  const toggleAnswerVisibility = (flashcardId) => {
    setAnswersVisible(prevState => ({
      ...prevState,
      [flashcardId]: !prevState[flashcardId]
    }));
  };

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSignupInputChange = (e) => {
    const { name, value } = e.target;
    setSignupData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:3001/api/users/login', loginData) // Only sending username and password
      .then(response => {
        localStorage.setItem('authToken', response.data.token); // Store token in localStorage
        setIsLoggedIn(true);
      })
      .catch(error => console.error('Error logging in:', error));
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:3001/api/users/signup', signupData)
      .then(response => {
        setIsSignup(false); // Switch to login after successful signup
      })
      .catch(error => console.error('Error signing up:', error));
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
  };

  // Function to delete a flashcard
  const deleteFlashcard = (flashcardId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this flashcard? This action cannot be undone.'
    );
    if (confirmed) {
      axios.delete(`http://localhost:3001/api/flashcards/${flashcardId}`)
        .then(response => {
          console.log(response.data.message); // Optional: You can use the message for a confirmation alert
  
          // Update flashcards state immediately after deleting
          setFlashcards(prevFlashcards => 
            prevFlashcards.filter(flashcard => flashcard.id !== flashcardId)
          );
  
          // Also update filteredFlashcards if you're filtering based on selectedSet
          setFilteredFlashcards(prevFilteredFlashcards => 
            prevFilteredFlashcards.filter(flashcard => flashcard.id !== flashcardId)
          );
  
        })
        .catch(error => {
          console.error('Error deleting the flashcard:', error.response.data.error);
        });
    }
  };
  
  const deleteSet = (setId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this set? This will also delete all associated flashcards.'
    );
    if (confirmed) {
      axios.delete(`http://localhost:3001/api/sets/${setId}`)
          .then(response => {
              console.log(response.data.message); // You can use the message for a confirmation alert
              // Remove the set from the local state
              setSets(prevSets => prevSets.filter(set => set.id !== setId));
              
              // Optionally reset selected set if it was the one deleted
              if (selectedSet === setId) {
                  setSelectedSet('');
              }
          })
          .catch(error => {
              console.error('Error deleting the set:', error.response.data.error);
          });
    }
  };

  return (
    <div className="App container mt-5">
      <h1 className="text-center mb-4">Flashcards</h1>

      {!isLoggedIn ? (
        // Display login or signup form based on state
        <div className="card">
          <div className="card-body">
            {isSignup ? (
              <>
                <h5 className="card-title">Sign Up</h5>
                <form onSubmit={handleSignupSubmit}>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input
                      type="text"
                      name="username"
                      id="username"
                      className="form-control"
                      value={signupData.username}
                      onChange={handleSignupInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      className="form-control"
                      value={signupData.password}
                      onChange={handleSignupInputChange}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">Sign Up</button>
                  <div className="mt-3 text-center">
                    <button onClick={() => setIsSignup(false)} className="btn btn-link">Already have an account? Log In</button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h5 className="card-title">Log In</h5>
                <form onSubmit={handleLoginSubmit}>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input
                      type="text"
                      name="username"
                      id="username"
                      className="form-control"
                      value={loginData.username}
                      onChange={handleLoginInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      className="form-control"
                      value={loginData.password}
                      onChange={handleLoginInputChange}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">Log In</button>
                  <div className="mt-3 text-center">
                    <button onClick={() => setIsSignup(true)} className="btn btn-link">Don't have an account? Sign Up</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      ) : (
        <>
          <button onClick={handleLogout} className="btn btn-danger mb-4 w-100">Log Out</button>

          {/* Add Flashcard Form */}
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
          <div className="col-md-6">
              <h5>Sets</h5>
              <ul className="list-group">
                {sets.map((set) => (
                  <li key={set.id} className="list-group-item d-flex justify-content-between align-items-center">
                    {set.name}
                    <button 
                      onClick={() => deleteSet(set.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>

          {/* Dropdown to filter flashcards by set */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Filter Flashcards by Set</h5>
              <select
                id="filterSetSelect"
                className="form-control"
                value={selectedSet}
                onChange={handleSetFilterChange}
              >
                <option value="">All Sets</option>
                {sets.map((set) => (
                  <option key={set.id} value={set.id}>
                    {set.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Display flashcards */}
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Flashcards</h5>
              <ul className="list-group">
                {filteredFlashcards.length > 0 ? (
                  filteredFlashcards.map((flashcard) => (
                    <li key={flashcard.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <strong>Set:</strong> {flashcard.set_name || 'None'}
                        <br />
                        <strong>Question:</strong> {flashcard.question}
                        <br />
                        {answersVisible[flashcard.id] && (
                          <div><strong>Answer:</strong> {flashcard.answer}</div>
                        )}
                      </div>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => toggleAnswerVisibility(flashcard.id)}
                      >
                        {answersVisible[flashcard.id] ? 'Hide Answer' : 'Show Answer'}
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteFlashcard(flashcard.id)}
                      >
                        Delete
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="list-group-item">No flashcards found.</li>
                )}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
