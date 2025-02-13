const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 🛠 CORS Configuration (Ensure smooth frontend-backend communication)
app.use(cors({
    origin: ["https://table-dhdp.vercel.app", "http://localhost:3000"], // Allow frontend
    credentials: true, // Allow cookies and sessions
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
}));

app.use(bodyParser.json());

// 🛡 Secure Sessions with Cookie Settings
app.use(session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === "production", // Set to true in production
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24, // 1 day
    }
}));

// 🛠 Connect to MongoDB with Proper Error Handling
console.log("Connecting to MongoDB at:", process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ Connected to MongoDB"))
  .catch(error => console.error("❌ MongoDB Connection Error:", error));

// 📌 Booking Schema & Model
const bookingSchema = new mongoose.Schema({
    date: { type: String, required: true },
    time: { type: String, required: true },
    guests: { type: Number, required: true },
    name: { type: String, required: true },
    contact: { type: String, required: true },
});

const Booking = mongoose.model('Booking', bookingSchema);

// 🛡 Authentication Middleware
const authMiddleware = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    } else {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
};

// 🛠 Authentication APIs
app.get('/api/check-auth', (req, res) => {
    if (req.session && req.session.user) {
        res.status(200).json({ authenticated: true, user: req.session.user });
    } else {
        res.status(401).json({ authenticated: false, message: "User not logged in." });
    }
});

// 🔐 Dummy Login API
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === "admin" && password === "password123") {
        req.session.user = { username: "admin" };
        res.status(200).json({ message: "Login successful", user: req.session.user });
    } else {
        res.status(401).json({ message: "Invalid credentials" });
    }
});

// 🔐 Logout API
app.post('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ message: "Error logging out" });
        res.status(200).json({ message: "Logout successful" });
    });
});

// 📌 Create Booking Endpoint (Protected)
app.post('/api/booking', authMiddleware, async (req, res) => {
    try {
        const booking = new Booking(req.body);
        await booking.save();
        res.status(201).json({ message: "Booking created successfully", booking });
    } catch (error) {
        console.error("Booking Error:", error);
        res.status(400).json({ message: "Failed to create booking", error });
    }
});

// 📌 Get All Bookings (Protected)
app.get('/api/booking', authMiddleware, async (req, res) => {
    try {
        const bookings = await Booking.find({});
        res.status(200).json(bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ message: "Failed to fetch bookings" });
    }
});

// 📌 Availability Check API
app.get("/api/availability", async (req, res) => {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "Date is required" });

    try {
        const bookingsOnDate = await Booking.find({ date });
        const availableSlots = [];
        for (let hour = 10; hour <= 22; hour++) { // Slots from 10 AM to 10 PM
            const slotTime = `${hour}:00`;
            if (!bookingsOnDate.some(b => b.time === slotTime)) {
                availableSlots.push(slotTime);
            }
        }
        console.log("✅ Available Slots:", availableSlots);
        res.status(200).json({ availableSlots });
    } catch (error) {
        console.error("❌ Availability Check Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// 🚀 Start Server
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
