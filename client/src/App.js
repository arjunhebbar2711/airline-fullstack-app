import { useState } from 'react';
import './App.css';

function App() {
  const [searchInput, setSearchInput] = useState('');
  const [flightData, setFlightData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [newFlight, setNewFlight] = useState({
    flightNumber: '', airline: '', origin: '', destination: '', status: 'On Time', gate: ''
  });
  const [createMessage, setCreateMessage] = useState('');
  const [newStatus, setNewStatus] = useState('On Time');

  // --- NEW MEMORY FOR DEPARTURE BOARD ---
  const [allFlights, setAllFlights] = useState([]);
  const [boardLoading, setBoardLoading] = useState(false);

  // --- READ (GET ONE) ---
  const handleSearch = () => {
    if (!searchInput) return;
    setLoading(true); setError(''); setFlightData(null);

    fetch(`http://localhost:5000/api/flights/${searchInput}`)
      .then(res => {
        if (!res.ok) throw new Error('Flight not found.');
        return res.json();
      })
      .then(data => { 
        setFlightData(data); 
        setNewStatus(data.status); 
        setLoading(false); 
      })
      .catch(err => { setError(err.message); setLoading(false); });
  };

  // --- NEW: READ (GET ALL) ---
  const handleFetchAllFlights = () => {
    setBoardLoading(true);
    // Notice the URL is just /api/flights (no specific number)
    fetch('http://localhost:5000/api/flights')
      .then(res => res.json())
      .then(data => {
        setAllFlights(data);
        setBoardLoading(false);
      })
      .catch(err => {
        alert("Failed to fetch departure board");
        setBoardLoading(false);
      });
  };

  // --- CREATE (POST) ---
  const handleCreateFlight = (e) => {
    e.preventDefault();
    setCreateMessage('Sending to database...');

    fetch('http://localhost:5000/api/flights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newFlight)
    })
      .then(res => res.json())
      .then(data => {
        if (data.error || data.message.includes('Error')) {
          setCreateMessage('❌ ' + data.message);
        } else {
          setCreateMessage('✅ Flight Added Successfully!');
          setNewFlight({ flightNumber: '', airline: '', origin: '', destination: '', status: 'On Time', gate: '' });
          // If the board is open, refresh it automatically!
          if (allFlights.length > 0) handleFetchAllFlights(); 
        }
      })
      .catch(() => setCreateMessage('❌ Failed to connect to server.'));
  };

  // --- UPDATE (PUT) ---
  const handleUpdateStatus = () => {
    fetch(`http://localhost:5000/api/flights/${flightData.flightNumber}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }) 
    })
      .then(res => res.json())
      .then(data => {
        setFlightData(data.flight); 
        alert('Status successfully updated!');
        if (allFlights.length > 0) handleFetchAllFlights(); // Refresh board
      })
      .catch(err => alert('Failed to update status.'));
  };

  // --- DELETE (DELETE) ---
  const handleDeleteFlight = () => {
    const confirmDelete = window.confirm(`Are you sure you want to delete flight ${flightData.flightNumber}?`);
    if (!confirmDelete) return;

    fetch(`http://localhost:5000/api/flights/${flightData.flightNumber}`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        setFlightData(null); 
        setSearchInput('');  
        if (allFlights.length > 0) handleFetchAllFlights(); // Refresh board
      })
      .catch(err => alert('Failed to delete flight.'));
  };

  const getStatusClass = (status) => `status-badge status-${status.replace(' ', '-')}`;

  return (
    <div className="dashboard-container">
      <h1>✈️ Airline Command Center</h1>
      
      {/* TOP SECTION: Search and Create */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
        
        {/* LEFT SIDE: SEARCH & MANAGE DASHBOARD */}
        <div style={{ flex: 1, minWidth: '300px', maxWidth: '400px' }}>
          <div className="search-section">
            <h3 style={{ color: '#64748b' }}>Lookup & Manage Flight</h3>
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
              <div className="info-grid" style={{ marginBottom: '20px' }}>
                <div>
                  <p className="info-label">Status</p>
                  <span className={getStatusClass(flightData.status)}>{flightData.status}</span>
                </div>
                <div>
                  <p className="info-label">Gate</p>
                  <p className="info-value">{flightData.gate}</p>
                </div>
              </div>

              <div style={{ borderTop: '2px dashed #e2e8f0', paddingTop: '20px', marginTop: '10px' }}>
                <p className="info-label">Admin Controls</p>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                  <select 
                    value={newStatus} 
                    onChange={(e) => setNewStatus(e.target.value)}
                    style={{ padding: '8px', borderRadius: '5px', flex: 1 }}
                  >
                    <option value="On Time">On Time</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <button onClick={handleUpdateStatus} className="search-button" style={{ padding: '8px 15px', backgroundColor: '#eab308', color: '#000' }}>Update</button>
                </div>
                <button onClick={handleDeleteFlight} className="search-button" style={{ width: '100%', backgroundColor: '#dc2626' }}>🗑️ Delete Entire Flight</button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDE: ADMIN DATA ENTRY FORM */}
        <div style={{ flex: 1, minWidth: '300px', maxWidth: '400px', background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', textAlign: 'left', height: 'fit-content' }}>
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
          {createMessage && <p style={{ textAlign: 'center', fontWeight: 'bold', marginTop: '15px' }}>{createMessage}</p>}
        </div>
      </div>

      {/* BOTTOM SECTION: DEPARTURE BOARD */}
      <div style={{ marginTop: '50px', paddingBottom: '50px' }}>
        <button onClick={handleFetchAllFlights} className="search-button" style={{ backgroundColor: '#0f172a', padding: '15px 30px', fontSize: '18px' }}>
          {boardLoading ? 'Loading...' : '📋 View Live Departure Board'}
        </button>

        {/* The map() function loops through our array of flights and creates a row for each one */}
        {allFlights.length > 0 && (
          <div className="departure-board">
            <h2 style={{ textAlign: 'left', marginTop: 0 }}>Live Flight Status</h2>
            <table className="flight-table">
              <thead>
                <tr>
                  <th>Flight</th>
                  <th>Airline</th>
                  <th>Route</th>
                  <th>Gate</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {allFlights.map((flight) => (
                  <tr key={flight._id}>
                    <td style={{ fontWeight: 'bold', color: '#0056b3' }}>{flight.flightNumber}</td>
                    <td>{flight.airline}</td>
                    <td>{flight.origin} ➔ {flight.destination}</td>
                    <td>{flight.gate}</td>
                    <td><span className={getStatusClass(flight.status)}>{flight.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

export default App;