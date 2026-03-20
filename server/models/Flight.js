const mongoose = require('mongoose');

const FlightSchema = new mongoose.Schema({
  flightNumber: { type: String, required: true, unique: true },
  airline: { type: String, required: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  departureTime: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['On Time', 'Delayed', 'Boarding', 'Departed'], 
    default: 'On Time' 
  },
  gate: { type: String, default: 'TBD' }
});

module.exports = mongoose.model('Flight', FlightSchema);