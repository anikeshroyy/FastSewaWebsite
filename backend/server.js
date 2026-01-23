const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Change 'localhost' to '127.0.0.1' MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/fastsewa')
    .then(() => console.log("MongoDB Connected Successfully"))
    .catch(err => console.error("MongoDB Connection Error:", err));

// 2. Define the Schema
const BookingSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: ['construction', 'land', 'finance', 'legal', 'medical', 'gst', 'incometax', 'material', 'repair', 'security', 'trademark'] // Matches your folder structure
    },
    fullName: String,
    email: String,
    phone: String,
    serviceType: String, // Specific service like "New House Construction" or "Land Registry"
    txnId: String,
    message: String,
    monthlyIncome: Number,
    monthlyExpense: Number,
    serviceType: String, // Maps to goalType in your form
    notes: String,       // Maps to additional details
    // Medical Specific Fields
    selectedDoc: String,
    bookDate: Date,
    timeSlot: String,
    date: { type: Date, default: Date.now }
});

const Booking = mongoose.model('Booking', BookingSchema);

// 3. API Routes

// Route to save data (from the frontend form)
app.post('/api/bookings', async (req, res) => {
    console.log("Received Data:", req.body); // Check your terminal for this!
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

// Route to get all data (for your Admin Dashboard)
app.get('/api/admin/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ date: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));