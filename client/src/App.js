import { useState } from 'react';
import './App.css';
import DepartureBoard from './components/DepartureBoard';
import AdminForm from './components/AdminForm';

function App() {
  const [searchInput, setSearchInput] = useState('');
  const [flightData, setFlightData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [newStatus, setNewStatus] = useState('On Time');

  // --- NEW MEMORY FOR DEPARTURE BOARD ---
  const [allFlights, setAllFlights] = useState([]);
  const [boardLoading, setBoardLoading] = useState(false);

  // --- READ (GET ONE) ---
  const handleSearch = () => {
    if (!searchInput) return;
    setLoading(true); setError(''); setFlightData(null);

    fetch(`https://airline-dashboard-mern.onrender.com/api/flights/${searchInput}`)
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
    fetch('https://airline-dashboard-mern.onrender.com/api/flights')
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

  // --- UPDATE (PUT) ---
  const handleUpdateStatus = () => {
    fetch(`https://airline-dashboard-mern.onrender.com/api/flights/${flightData.flightNumber}`, {
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

    fetch(`https://airline-dashboard-mern.onrender.com/api/flights/${flightData.flightNumber}`, {
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
        <AdminForm refreshBoard={() => { if (allFlights.length > 0) handleFetchAllFlights(); }} />
        
      </div>

      {/* BOTTOM SECTION: DEPARTURE BOARD */}
      <DepartureBoard 
        allFlights={allFlights} 
        boardLoading={boardLoading} 
        onFetchFlights={handleFetchAllFlights} 
      />

    </div>
  );
}

export default App;