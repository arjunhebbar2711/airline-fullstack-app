const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Flight = require('./models/Flight.js');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Allows the server to understand JSON

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to Airline Database successfully!"))
  .catch((err) => console.log("Database connection error: ", err));

// Simple test route
app.get('/', (req, res) => {
  res.send('Airline Backend is running!');
});

app.get('/seed-flight', async (req, res) => {
  try {
    const testFlight = new Flight({
      flightNumber: 'AI-202',
      airline: 'Air India',
      origin: 'DEL',
      destination: 'BOM',
      departureTime: new Date(),
      status: 'On Time',
      gate: 'B12'
    });
    await testFlight.save();
    res.send('Test flight added to database!');
  } catch (err) {
    res.status(500).send('Error adding flight: ' + err.message);
  }
});

// Search API: Get flight status by Flight Number
app.get('/api/flights/:flightNumber', async (req, res) => {
  try {
    // 1. Grab the flight number from the URL and make it uppercase
    const searchNumber = req.params.flightNumber.toUpperCase();
    
    // 2. Ask MongoDB to find one flight that matches that number
    const flight = await Flight.findOne({ flightNumber: searchNumber });

    // 3. If no flight is found, send a 404 error
    if (!flight) {
      return res.status(404).json({ message: "Flight not found. Please check your number." });
    }

    // 4. If found, send the flight data back as JSON
    res.json(flight);

  } catch (err) {
    res.status(500).json({ message: "Error searching for flight." });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is flying on port ${PORT}`);
});