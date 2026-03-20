import { useState } from 'react';
import './App.css';

function App() {
  // --- SEARCH MEMORY ---
  const [searchInput, setSearchInput] = useState('');
  const [flightData, setFlightData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- NEW: CREATION MEMORY ---
  // This holds whatever the user types into the 5 form boxes
  const [newFlight, setNewFlight] = useState({
    flightNumber: '', airline: '', origin: '', destination: '', status: 'On Time', gate: ''
  });
  const [createMessage, setCreateMessage] = useState('');

  // --- EXISTING SEARCH FUNCTION ---
  const handleSearch = () => {
    if (!searchInput) return;
    setLoading(true); setError(''); setFlightData(null);

    fetch(`http://localhost:5000/api/flights/${searchInput}`)
      .then(res => {
        if (!res.ok) throw new Error('Flight not found.');
        return res.json();
      })
      .then(data => { setFlightData(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  };

  // --- NEW: CREATE FLIGHT FUNCTION ---
  const handleCreateFlight = (e) => {
    e.preventDefault(); // Stops the page from refreshing when you submit the form
    setCreateMessage('Sending to database...');

    // We use a POST request to send data to the server
    fetch('http://localhost:5000/api/flights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newFlight) // Turns our React memory into JSON
    })
      .then(res => res.json())
      .then(data => {
        if (data.error || data.message.includes('Error')) {
          setCreateMessage('❌ ' + data.message);
        } else {
          setCreateMessage('✅ Flight Added Successfully!');
          // Clear the form boxes
          setNewFlight({ flightNumber: '', airline: '', origin: '', destination: '', status: 'On Time', gate: '' });
        }
      })
      .catch(() => setCreateMessage('❌ Failed to connect to server.'));
  };

  const getStatusClass = (status) => `status-badge status-${status.replace(' ', '-')}`;

  return (
    <div className="dashboard-container">
      <h1>✈️ Airline Command Center</h1>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
        
        {/* LEFT SIDE: SEARCH DASHBOARD */}
        <div style={{ flex: 1, minWidth: '300px', maxWidth: '400px' }}>
          <div className="search-section">
            <h3 style={{ color: '#64748b' }}>Lookup Flight</h3>
            <input 
              type="text" className="search-input" placeholder="e.g., AI-202" 
              value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
            />
            <button className="search-button" onClick={handleSearch} style={{ marginTop: '10px' }}>Search</button>
          </div>

          {loading && <p>Contacting control tower...</p>}
          {error && <p style={{ color: '#991b1b' }}>{error}</p>}
          
          {flightData && (
            <div className="boarding-pass">
              <p className="airline-name">{flightData.airline}</p>
              <h2 className="flight-header">Flight {flightData.flightNumber}</h2>
              <div className="route-container">
                <span className="airport-code">{flightData.origin}</span>
                <span>➔</span>
                <span className="airport-code">{flightData.destination}</span>
              </div>
              <div className="info-grid">
                <div>
                  <p className="info-label">Status</p>
                  <span className={getStatusClass(flightData.status)}>{flightData.status}</span>
                </div>
                <div>
                  <p className="info-label">Gate</p>
                  <p className="info-value">{flightData.gate}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDE: ADMIN DATA ENTRY FORM */}
        <div style={{ flex: 1, minWidth: '300px', maxWidth: '400px', background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', textAlign: 'left' }}>
          <h3 style={{ color: '#64748b', marginTop: 0, textAlign: 'center' }}>Admin: Add New Flight</h3>
          
          <form onSubmit={handleCreateFlight} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input required placeholder="Flight Number (e.g., F9-100)" value={newFlight.flightNumber} onChange={(e) => setNewFlight({...newFlight, flightNumber: e.target.value.toUpperCase()})} style={{ padding: '8px' }}/>
            <input required placeholder="Airline Name" value={newFlight.airline} onChange={(e) => setNewFlight({...newFlight, airline: e.target.value})} style={{ padding: '8px' }}/>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <input required placeholder="Origin (ATL)" value={newFlight.origin} onChange={(e) => setNewFlight({...newFlight, origin: e.target.value.toUpperCase()})} style={{ padding: '8px', width: '50%' }} maxLength="3"/>
              <input required placeholder="Dest (LAX)" value={newFlight.destination} onChange={(e) => setNewFlight({...newFlight, destination: e.target.value.toUpperCase()})} style={{ padding: '8px', width: '50%' }} maxLength="3"/>
            </div>
            
            <input required placeholder="Gate (e.g., C4)" value={newFlight.gate} onChange={(e) => setNewFlight({...newFlight, gate: e.target.value.toUpperCase()})} style={{ padding: '8px' }}/>
            
            <select value={newFlight.status} onChange={(e) => setNewFlight({...newFlight, status: e.target.value})} style={{ padding: '8px' }}>
              <option value="On Time">On Time</option>
              <option value="Delayed">Delayed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <button type="submit" className="search-button" style={{ backgroundColor: '#166534', marginTop: '10px' }}>Submit to Database</button>
          </form>

          {/* Shows success or error message below the form */}
          {createMessage && <p style={{ textAlign: 'center', fontWeight: 'bold', marginTop: '15px' }}>{createMessage}</p>}
        </div>

      </div>
    </div>
  );
}

export default App;