const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
require("dotenv").config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URL = process.env.MONGODB_URL;

// Middleware
app.use(cors());
app.use(express.json());

// Define MongoDB Schema
const Schema = mongoose.Schema;
const userSchema = new Schema({
  username: String,
});

const loginSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Define MongoDB Model
const User = mongoose.model("User", userSchema);
const LoginDetails = mongoose.model("LoginDetails", loginSchema);

// Connect to MongoDB
mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.log("Connected to MongoDB");

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit process with failure
  });

// User Registration Route
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  try {
    // Check if user already exists
    const existingUser = await LoginDetails.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new LoginDetails({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Error registering user" });
  }
});

// User Login Route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  try {
    // Find the user by username
    const user = await LoginDetails.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Compare the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Error during login" });
  }
});

// Get All Users Route
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Error fetching users" });
  }
});

// Endpoint to handle adding a new username (POST request)
app.post("/", async (req, res) => {
  try {
    const { username } = req.body;
    const newUser = new User({ username });
    await newUser.save();
    res.status(201).json(newUser); // Return the newly created user
  } catch (error) {
    console.error("Error adding username:", error.message);
    res.status(500).json({ error: "Failed to add username" });
  }
});

// Endpoint to handle fetching all usernames (GET request)
app.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error("Error fetching usernames:", error.message);
    res.status(500).json({ error: "Failed to fetch usernames" });
  }
});

// Endpoint to handle updating a username (PUT request)
app.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { username } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { username },
      { new: true } // To return the updated document
    );
    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating username:", error.message);
    res.status(500).json({ error: "Failed to update username" });
  }
});

// Endpoint to handle deleting a username (DELETE request)
app.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await User.findByIdAndDelete(id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting username:", error.message);
    res.status(500).json({ error: "Failed to delete username" });
  }
});

// Serve static assets (if necessary) - for React frontend

module.exports = app;
