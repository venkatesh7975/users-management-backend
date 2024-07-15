// server.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json());

// Define MongoDB Schema
const Schema = mongoose.Schema;
const userSchema = new Schema({
  username: String,
});

// Define MongoDB Model
const User = mongoose.model("User", userSchema);

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit process with failure
  });

// Endpoint to handle adding a new username (POST request)
app.post("/", async (req, res) => {
  try {
    const { username } = req.body; // Extracting username from request body
    const newUser = new User({ username });
    await newUser.save(); // Saving username to MongoDB
    res.status(201).json({ message: "Username added successfully" });
  } catch (error) {
    console.error("Error adding username:", error.message);
    res.status(500).json({ error: "Failed to add username" });
  }
});

// Endpoint to handle fetching all usernames (GET request)
app.get("/", async (req, res) => {
  try {
    const users = await User.find(); // Fetching all usernames from MongoDB
    res.json(users);
  } catch (error) {
    console.error("Error fetching usernames:", error.message);
    res.status(500).json({ error: "Failed to fetch usernames" });
  }
});

// Serve static assets (if necessary) - for React frontend

module.exports = app;
