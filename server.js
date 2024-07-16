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
