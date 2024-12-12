import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css'; // Add custom styles here

function App() {
  const [flashcards, setFlashcards] = useState([]);
  const [filteredFlashcards, setFilteredFlashcards] = useState([]);
  const [sets, setSets] = useState([]);
  const [newFlashcard, setNewFlashcard] = useState({ question: '', answer: '', set_id: '' });
  const [newSetName, setNewSetName] = useState('');
  const [selectedSet, setSelectedSet] = useState('');
  const [answersVisible, setAnswersVisible] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [signupData, setSignupData] = useState({ username: '', password: '' });
  const [isSignup, setIsSignup] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('authToken')) {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchSets();
    }
  }, [isLoggedIn]);

  const fetchFlashcards = useCallback(() => {
    axios.get('http://localhost:3001/api/flashcards')
      .then(response => {
        const flashcardsWithSetIds = response.data.map(flashcard => {
          const matchingSet = sets.find(set => set.name === flashcard.set_name);
          return {
            ...flashcard,
            set_id: matchingSet ? matchingSet.id : null,
          };
        });
        setFlashcards(flashcardsWithSetIds);
        setFilteredFlashcards(flashcardsWithSetIds.filter(flashcard =>
          selectedSet === '' || flashcard.set_id === selectedSet
        ));
      })
      .catch(error => console.error('Error fetching flashcards:', error));
  }, [sets, selectedSet]);

  useEffect(() => {
    if (isLoggedIn && sets.length > 0) {
      fetchFlashcards();
    }
  }, [isLoggedIn, sets, fetchFlashcards]);

  const fetchSets = () => {
    axios.get('http://localhost:3001/api/sets')
      .then(response => {
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
        setFlashcards(prevState => {
          const updatedFlashcards = [...prevState, flashcardWithSetName];
          setFilteredFlashcards(updatedFlashcards.filter(flashcard =>
            selectedSet === '' || flashcard.set_id === selectedSet
          ));
          return updatedFlashcards;
        });
        setNewFlashcard({ question: '', answer: '', set_id: '' });
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
    const selectedSetId = parseInt(event.target.value, 10) || '';
    setSelectedSet(selectedSetId);
    const newFilteredFlashcards = selectedSetId === ''
      ? flashcards
      : flashcards.filter(flashcard => flashcard.set_id === selectedSetId);
    setFilteredFlashcards(newFilteredFlashcards);
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
    axios.post('http://localhost:3001/api/users/login', loginData)
      .then(response => {
        localStorage.setItem('authToken', response.data.token);
        setIsLoggedIn(true);
      })
      .catch(error => console.error('Error logging in:', error));
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:3001/api/users/signup', signupData)
      .then(() => setIsSignup(false))
      .catch(error => console.error('Error signing up:', error));
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
  };

  const deleteFlashcard = (flashcardId) => {
    if (window.confirm('Are you sure you want to delete this flashcard?')) {
      axios.delete(`http://localhost:3001/api/flashcards/${flashcardId}`)
        .then(() => {
          setFlashcards(prev => prev.filter(flashcard => flashcard.id !== flashcardId));
          setFilteredFlashcards(prev => prev.filter(flashcard => flashcard.id !== flashcardId));
        })
        .catch(error => console.error('Error deleting the flashcard:', error));
    }
  };

  const deleteSet = (setId) => {
    if (window.confirm('Are you sure you want to delete this set? This will also delete all associated flashcards.')) {
      axios.delete(`http://localhost:3001/api/sets/${setId}`)
        .then(() => {
          setSets(prev => prev.filter(set => set.id !== setId));
          if (selectedSet === setId) {
            setSelectedSet('');
          }
        })
        .catch(error => console.error('Error deleting the set:', error));
    }
  };

  return (
    <div className="App container mt-5">
      <h1 className="text-center mb-4">Flashcards</h1>

      {!isLoggedIn ? (
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

          <div className="row">
            <div className="col-md-6">
              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title">Add a New Flashcard</h5>
                  <form onSubmit={handleFlashcardSubmit}>
                    <div className="mb-3">
                      <label htmlFor="question" className="form-label">Question</label>
                      <input
                        type="text"
                        name="question"
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
                        className="form-control"
                        value={newFlashcard.set_id}
                        onChange={handleFlashcardInputChange}
                      >
                        <option value="">Select a set</option>
                        {sets.map(set => (
                          <option key={set.id} value={set.id}>{set.name}</option>
                        ))}
                      </select>
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Add Flashcard</button>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title">Add a New Set</h5>
                  <form onSubmit={handleSetSubmit}>
                    <div className="mb-3">
                      <label htmlFor="setName" className="form-label">Set Name</label>
                      <input
                        type="text"
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

              <h5>Sets</h5>
              <ul className="list-group">
                {sets.map(set => (
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
          </div>

          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Filter Flashcards by Set</h5>
              <select
                className="form-control"
                value={selectedSet}
                onChange={handleSetFilterChange}
              >
                <option value="">All Sets</option>
                {sets.map(set => (
                  <option key={set.id} value={set.id}>{set.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Flashcards</h5>
              <ul className="list-group">
                {filteredFlashcards.length > 0 ? (
                  filteredFlashcards.map(flashcard => (
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
                      <div>
                        <button
                          className="btn btn-secondary btn-sm me-2"
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
                      </div>
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
