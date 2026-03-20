import { useState, useEffect } from 'react';
import './App.css';

function App() {
  // 1. Set up "memory" for our component to hold the data
  const [flightData, setFlightData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 2. Fetch the data from your Node.js backend as soon as the page loads
  useEffect(() => {
    fetch('http://localhost:5000/api/flights/AI-202')
      .then((response) => {
        if (!response.ok) throw new Error('Could not connect to backend');
        return response.json(); // Convert the raw response into JSON
      })
      .then((data) => {
        setFlightData(data); // Save the data to our React memory
        setLoading(false);   // Turn off the loading message
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []); // The empty brackets mean "only run this once when the page loads"

  // 3. Display the visuals on the screen
  return (
    <div className="App" style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>✈️ Airline Dashboard</h1>
      
      {/* If waiting for data, show a loading message */}
      {loading && <p>Contacting control tower...</p>}

      {/* If there's an error, show it in red */}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      {/* If we successfully got the data, display our Flight Card! */}
      {flightData && (
        <div style={{ 
          border: '2px solid #ccc', 
          padding: '20px', 
          maxWidth: '350px', 
          borderRadius: '10px',
          backgroundColor: '#f8f9fa',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ margin: '0 0 10px 0' }}>{flightData.airline}</h2>
          <h3 style={{ color: '#0056b3', marginTop: 0 }}>Flight {flightData.flightNumber}</h3>
          <hr />
          <p><strong>Route:</strong> {flightData.origin} ➔ {flightData.destination}</p>
          <p><strong>Status:</strong> <span style={{ color: 'green', fontWeight: 'bold' }}>{flightData.status}</span></p>
          <p><strong>Gate:</strong> {flightData.gate}</p>
        </div>
      )}
    </div>
  );
}

export default App;