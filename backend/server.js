const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// 1. Middleware
// CORS for hosted frontend
app.use(cors({
    origin: '*', // This allows requests from ANY website (local or hosted)
    methods: ['GET', 'POST']
}));

app.use(bodyParser.json());

// MongoDB connection For LocalHost
// mongoose.connect('mongodb://127.0.0.1:27017/fastsewa')
//     .then(() => console.log("MongoDB Connected Successfully"))
//     .catch(err => console.error("MongoDB Connection Error:", err));

// 2. MongoDB Connection using environment variable
const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI)
    .then(() => console.log("MongoDB Atlas Connected Successfully"))
    .catch(err => console.error("MongoDB Connection Error:", err));

// 3. Schema
const BookingSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: ['construction', 'land', 'finance', 'legal', 'medical', 'gst', 'incometax', 'material', 'repair', 'security', 'trademark'] // Matches your folder structure
    },
    fullName: String,
    email: String,
    phone: String,
    txnId: String,
    message: String,
    monthlyIncome: Number,
    monthlyExpense: Number,
    serviceType: String, // Maps to goalType in form
    notes: String,       // Maps to additional details
    selectedDoc: String, // Medical Specific Fields
    bookDate: Date,
    timeSlot: String,
    date: { type: Date, default: Date.now }
});

const Booking = mongoose.model('Booking', BookingSchema);

// 3. API Routes to save data (from the frontend form)
app.post('/api/bookings', async (req, res) => {
    console.log("Received Data:", req.body); // Check terminal for this!
    try {
        const newBooking = new Booking(req.body);
        const savedBooking = await newBooking.save();
        console.log("Saved to DB:", savedBooking);
        res.status(201).json({ message: "Booking saved successfully!", data: savedBooking });
    } catch (err) {
        console.error("Save Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 4. Route to get all data (for Admin Dashboard)
app.get('/api/admin/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ date: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. PORT: Railway will provide a port via process.env.PORT
const PORT = process.env.PORT || 5000;
// Note: '0.0.0.0' is important for Railway's network binding
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));

// const PORT = 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));