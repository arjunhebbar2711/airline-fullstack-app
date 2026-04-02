import React from 'react';

function DepartureBoard({ allFlights, boardLoading, onFetchFlights }) {
  
  // We moved the styling function here so the component is self-contained!
  const getStatusClass = (status) => `status-badge status-${status.replace(' ', '-')}`;

  return (
    <div style={{ marginTop: '50px', paddingBottom: '50px' }}>
      <button 
        onClick={onFetchFlights} 
        className="search-button" 
        style={{ backgroundColor: '#0f172a', padding: '15px 30px', fontSize: '18px' }}
      >
        {boardLoading ? 'Loading...' : '📋 View Live Departure Board'}
      </button>

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
  );
}

export default DepartureBoard;