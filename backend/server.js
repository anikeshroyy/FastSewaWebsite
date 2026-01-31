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
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use(bodyParser.json());

// MongoDB connection For LocalHost
// mongoose.connect('mongodb://127.0.0.1:27017/fastsewa')
//     .then(() => console.log("MongoDB Connected Successfully"))
//     .catch(err => console.error("MongoDB Connection Error:", err));

// MongoDB connection For Railway
const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI)
    .then(() => console.log("MongoDB Atlas Connected Successfully"))
    .catch(err => console.error("MongoDB Connection Error:", err));


// ---User Register SCHEMA ---
const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },

    // derived / display fields
    fullName: { type: String },

    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    phone: String,
    address: String,

    userType: { type: String, default: 'customer' },
    date: { type: Date, default: Date.now }
});


const User = mongoose.model('User', UserSchema);

// ---SIGNUP ROUTE ---
app.post('/api/auth/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone, userType } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const newUser = new User({
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`,
            email,
            password,
            phone,
            userType
        });
        await newUser.save();

        // Send back success and a "fake" token for now (since you're using fastsewa_token)
        res.status(201).json({
            success: true,
            message: "User registered!",
            token: "mock-jwt-token-" + newUser._id,
            user: {
                id: newUser._id,
                firstName: newUser.firstName,
                email: newUser.email,
                userType: newUser.userType
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- LOGIN ROUTE ---
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // 2. Check password (Direct comparison for now, use bcrypt later!)
        if (user.password !== password) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // 3. Send success response
        res.json({
            success: true,
            token: "mock-jwt-token-" + user._id,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                address: user.address,
                userType: user.userType
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- UPDATE USER PROFILE ---
app.put('/api/auth/update', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        console.log("AUTH HEADER:", authHeader);

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Invalid token format" });
        }

        const token = authHeader.replace("Bearer ", "");
        const userId = token.replace("mock-jwt-token-", "");
        console.log("USER ID:", userId);


        if (!userId) {
            return res.status(401).json({ message: "Invalid token" });
        }

        const { fullName, phone, address } = req.body;
        console.log("UPDATE DATA:", { fullName, phone, address });

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                fullName,
                phone,
                address
            },
            { new: true }
        );
        console.log("UPDATED USER FROM DB:", updatedUser);

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            success: true,
            user: {
                id: updatedUser._id,
                fullName: updatedUser.fullName,
                email: updatedUser.email,
                phone: updatedUser.phone,
                address: updatedUser.address,
                userType: updatedUser.userType
            }
        });

    } catch (err) {
        console.error("Profile Update Error:", err);
        res.status(500).json({ message: "Server error" });
    }
});


//--------Booking Schema-----------
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
    date: { type: Date, default: Date.now },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // This must match the name of your User model
        required: false // Set to false for now so old data doesn't break
    },
    status: {
        type: String,
        enum: ['pending', 'verified', 'assigned', 'completed', 'cancelled'],
        default: 'pending'
    }
});

const Booking = mongoose.model('Booking', BookingSchema);

// 3. API Routes to save data (from the frontend form)
app.post('/api/bookings', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const token = authHeader.replace("Bearer ", "");
        const userId = token.replace("mock-jwt-token-", "");

        const bookingData = {
            ...req.body,
            userId
        };

        const newBooking = new Booking(bookingData);
        const savedBooking = await newBooking.save();

        res.status(201).json({
            success: true,
            booking: savedBooking
        });

    } catch (err) {
        console.error("BOOKING SAVE ERROR:", err);
        res.status(500).json({ message: "Server error" });
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

// --- GET CURRENT LOGGED-IN USER ---
app.get('/api/auth/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const token = authHeader.replace("Bearer ", "");
        const userId = token.replace("mock-jwt-token-", "");

        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            success: true,
            user
        });

    } catch (err) {
        console.error("GET ME ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// --- GET LOGGED-IN USER BOOKINGS ---
app.get('/api/bookings/my', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const token = authHeader.replace("Bearer ", "");
        const userId = token.replace("mock-jwt-token-", "");

        const bookings = await Booking.find({ userId })
            .sort({ date: -1 });

        res.json({
            success: true,
            bookings
        });

    } catch (err) {
        console.error("MY BOOKINGS ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
});


async function requireAdmin(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const token = authHeader.replace("Bearer ", "");
        const userId = token.replace("mock-jwt-token-", "");

        const user = await User.findById(userId);

        if (!user || user.userType !== "admin") {
            return res.status(403).json({ message: "Admin access required" });
        }

        req.admin = user;
        next();
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}



app.get('/api/admin/users', requireAdmin, async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ date: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch users" });
    }
});


app.post('/api/admin/users', requireAdmin, async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone, userType } = req.body;

        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const user = new User({
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`,
            email,
            password,
            phone,
            userType
        });

        await user.save();

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to create user" });
    }
});


app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete user" });
    }
});


app.put('/api/admin/bookings/:id', requireAdmin, async (req, res) => {
    try {
        const { status } = req.body;

        await Booking.findByIdAndUpdate(req.params.id, { status });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: "Failed to update booking" });
    }
});


app.delete('/api/admin/bookings/:id', requireAdmin, async (req, res) => {
    try {
        await Booking.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete booking" });
    }
});


// 5. PORT: Railway will provide a port via process.env.PORT
// Note: '0.0.0.0' is important for Railway's network binding
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));

// const PORT = 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));