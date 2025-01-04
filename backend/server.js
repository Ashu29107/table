const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(cors({
    origin: "http://table-dhdp.vercel.app",
  }));

// Log MongoDB URI for debugging
console.log("MongoDB URI:", process.env.MONGO_URI);


// Connect to MongoDB using environment variable
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


// Connect to MongoDB
mongoose.connect(
    'mongodb://localhost:27017/Booking', 
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
);

// Booking Schema
const bookingSchema = new mongoose.Schema({
    date: { type: String, required: true },
    time: { type: String, required: true },
    guests: { type: Number, required: true },
    name: { type: String, required: true },
    contact: { type: String, required: true },
});

const Booking = mongoose.model('Booking', bookingSchema);

// Create Booking Endpoint
app.post('/api/booking', async (req, res) => {
    const booking = new Booking(req.body);
    try {
        await booking.save();
        res.status(201).send(booking);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Get All Bookings Endpoint
app.get('/api/booking', async (req, res) => {
    try {
        const bookings = await Booking.find({});
        res.status(200).send(bookings);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Availability Endpoint
app.get("/api/availability", async (req, res) => { // Changed this line to /api/availability
    const { date } = req.query; // Expecting a date query parameter
    try {
        const bookingsOnDate = await Booking.find({ date });
        const availableSlots = [];
        for (let hour = 10; hour <= 22; hour++) { // Assuming slots from 10 AM to 10 PM
            const slotTime = `${hour}:00`;
            if (!bookingsOnDate.some(b => b.time === slotTime)) {
                availableSlots.push(slotTime);
            }
        }
        res.status(200).json({ availableSlots });
    } catch (error) {
        res.status(500).send(error);
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
