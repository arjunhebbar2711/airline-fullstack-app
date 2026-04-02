import React, { useState } from 'react';

// We only need one prop from App.js: a function to trigger a board refresh if needed
function AdminForm({ refreshBoard }) {
  
  // This memory now lives locally inside the form!
  const [newFlight, setNewFlight] = useState({
    flightNumber: '', airline: '', origin: '', destination: '', status: 'On Time', gate: ''
  });
  const [createMessage, setCreateMessage] = useState('');

  // The creation logic moved here too (using your live Render URL!)
  const handleCreateFlight = (e) => {
    e.preventDefault();
    setCreateMessage('Sending to database...');

    fetch('https://airline-dashboard-mern.onrender.com/api/flights', {
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
          
          // Tell App.js to refresh the departure board!
          refreshBoard(); 
        }
      })
      .catch(() => setCreateMessage('❌ Failed to connect to server.'));
  };

  return (
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
  );
}

export default AdminForm;