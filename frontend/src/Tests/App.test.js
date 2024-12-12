import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import axios from 'axios';

jest.mock('axios'); // Mock axios globally

describe('App Component', () => {
  beforeEach(() => {
    // Clear the localStorage and mock any required axios responses before each test
    localStorage.clear();
  });

  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/Flashcards/i)).toBeInTheDocument();
  });

  it('allows login and fetches sets', async () => {
    // Mock axios responses
    axios.post.mockResolvedValueOnce({ data: { token: 'fakeToken' } }); // Login
    axios.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'Set 1' }] }); // Fetch sets

    // Render the app
    render(<App />);

    // Simulate user login
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'user' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByText(/Log In/i));

    await waitFor(() => expect(axios.get).toHaveBeenCalledWith('http://localhost:3001/api/sets'));

    // Check if the sets are displayed
    expect(screen.getByText(/Set 1/i)).toBeInTheDocument();
  });

  it('should add a new set', async () => {
    axios.post.mockResolvedValueOnce({ data: { id: 2, name: 'Set 2' } }); // New set creation
    axios.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'Set 1' }] }); // Fetch sets

    render(<App />);

    // Log in
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'user' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByText(/Log In/i));

    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    // Add a new set
    fireEvent.change(screen.getByLabelText(/Set Name/i), { target: { value: 'Set 2' } });
    fireEvent.click(screen.getByText(/Add Set/i));

    await waitFor(() => {
      // Check if new set is added
      expect(screen.getByText(/Set 2/i)).toBeInTheDocument();
    });
  });

  it('should add a flashcard to a set', async () => {
    // Mock API responses
    axios.post.mockResolvedValueOnce({ data: { id: 1, question: 'Test Question', answer: 'Test Answer', set_id: 1 } }); // Flashcard creation
    axios.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'Set 1' }] }); // Fetch sets

    render(<App />);

    // Log in
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'user' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByText(/Log In/i));

    await waitFor(() => expect(axios.get).toHaveBeenCalled());

    // Add flashcard
    fireEvent.change(screen.getByLabelText(/Question/i), { target: { value: 'Test Question' } });
    fireEvent.change(screen.getByLabelText(/Answer/i), { target: { value: 'Test Answer' } });
    fireEvent.change(screen.getByLabelText(/Set/i), { target: { value: 1 } });
    fireEvent.click(screen.getByText(/Add Flashcard/i));

    await waitFor(() => {
      // Check if flashcard is added
      expect(screen.getByText(/Test Question/i)).toBeInTheDocument();
    });
  });

  it('should show and hide the answer of a flashcard', async () => {
    axios.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'Set 1' }] }); // Fetch sets
    axios.get.mockResolvedValueOnce({ data: [{ id: 1, question: 'Test Question', answer: 'Test Answer', set_name: 'Set 1' }] }); // Fetch flashcards

    render(<App />);

    // Log in
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'user' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByText(/Log In/i));

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

    // Click to show answer
    fireEvent.click(screen.getByText(/Show Answer/i));

    // Check if the answer is displayed
    expect(screen.getByText(/Test Answer/i)).toBeInTheDocument();

    // Click to hide answer
    fireEvent.click(screen.getByText(/Hide Answer/i));

    // Check if the answer is hidden
    expect(screen.queryByText(/Test Answer/i)).not.toBeInTheDocument();
  });

  it('logs out the user', () => {
    render(<App />);

    // Simulate user logging out
    fireEvent.click(screen.getByText(/Log Out/i));

    // Check if user is logged out
    expect(screen.getByText(/Log In/i)).toBeInTheDocument();
  });
});
