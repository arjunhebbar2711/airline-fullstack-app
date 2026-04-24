const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Flight = require('./models/Flight.js');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Allows the server to understand JSON

// ==========================================
// SECURITY LAYER (JWT)
// ==========================================
const SECRET_KEY = 'AirlineSuperSecretKey99!'; // In enterprise, this goes in a .env file!

// 1. The Mint: Creates the token if the password is correct
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  
  if (password === 'admin123') {
    // Password is correct! Create a token that expires in 2 hours
    const token = jwt.sign({ role: 'admin' }, SECRET_KEY, { expiresIn: '2h' });
    res.json({ message: 'Login successful', token: token });
  } else {
    res.status(401).json({ error: '❌ Invalid password' });
  }
});

// 2. The Bouncer: Checks for a valid token on protected routes
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(403).json({ error: '❌ Access Denied: No VIP wristband (token) provided.' });
  }

  // Tokens look like "Bearer eyJhbGciOi...", so we split it to get just the token string
  const token = authHeader.split(' ')[1]; 

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: '❌ Access Denied: Wristband is fake or expired.' });
    }
    next(); // Token is valid! Let them through the door.
  });
};

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
      flightNumber: 'DL-404',
      airline: 'Delta Air Lines',
      origin: 'ATL',
      destination: 'DFW',
      departureTime: new Date(),
      status: 'Delayed', // Let's mix up the status!
      gate: 'T14'
    });
    await testFlight.save();
    res.send('Second test flight added to database!');
  } catch (error) {
    res.status(500).send("Error saving flight");
  }
});

// GET API: Fetch ALL flights for the Departure Board
app.get('/api/flights', async (req, res) => {
  try {
    // Calling .find() with nothing inside the brackets tells MongoDB to return everything!
    const allFlights = await Flight.find(); 
    res.json(allFlights);
  } catch (error) {
    res.status(500).json({ message: "Error fetching flights." });
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

// POST API: Add a brand new flight from the React frontend
app.post('/api/flights', verifyToken, async (req, res) => {
  try {
    const flightData = req.body;
    
    // Automatically add a timestamp 
    flightData.departureTime = new Date(); 

    const newFlight = new Flight(flightData); 
    await newFlight.save();
    
    console.log("SUCCESS! Flight added:", flightData.flightNumber);
    res.status(201).json({ message: "Flight successfully added!", flight: newFlight });
  } catch (error) {
    // This will print the EXACT reason MongoDB is mad in your terminal!
    console.log("DATABASE REJECTION ERROR:", error.message); 
    res.status(400).json({ message: "Error adding flight. Check if flight number already exists." });
  }
});

// PUT API: Update an existing flight's status or gate
app.put('/api/flights/:flightNumber', verifyToken, async (req, res) => {
  try {
    const searchNumber = req.params.flightNumber.toUpperCase();
    
    // Find the flight by number, apply the new data from req.body, and return the updated version
    const updatedFlight = await Flight.findOneAndUpdate(
      { flightNumber: searchNumber },
      req.body,
      { new: true } // This tells MongoDB to send back the NEW data, not the old data
    );

    if (!updatedFlight) {
      return res.status(404).json({ message: "Flight not found." });
    }

    res.json({ message: "Flight updated successfully!", flight: updatedFlight });
  } catch (error) {
    res.status(500).json({ message: "Error updating flight." });
  }
});

// DELETE API: Cancel/Remove a flight from the database
app.delete('/api/flights/:flightNumber', verifyToken, async (req, res) => {
  try {
    const searchNumber = req.params.flightNumber.toUpperCase();
    
    // Find the flight and permanently delete it
    const deletedFlight = await Flight.findOneAndDelete({ flightNumber: searchNumber });

    if (!deletedFlight) {
      return res.status(404).json({ message: "Flight not found." });
    }

    res.json({ message: "Flight deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting flight." });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is flying on port ${PORT}`);
});