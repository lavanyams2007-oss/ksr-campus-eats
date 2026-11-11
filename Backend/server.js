require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Import routes
const authRoutes = require("./routes/authRoutes");
const foodRoutes = require("./routes/foodRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminOrderRoutes = require("./routes/adminOrderRoutes");
const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173"
  })
);

app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "KSR Campus Eats API is running!"
  });
});

// Student authentication routes
app.use("/api/auth", authRoutes);

// Admin authentication routes
app.use("/api/admin", adminRoutes);
app.use("/api/admin/orders", adminOrderRoutes);

// Food management routes
app.use("/api/foods", foodRoutes);

// Order management routes
app.use("/api/orders", orderRoutes);

// Handle unknown API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found."
  });
});

// Start server after MongoDB connects
async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from .env");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing from .env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Atlas connected successfully!");

    const port = process.env.PORT || 5000;

    app.listen(port, () => {
      console.log(`Backend running at http://localhost:${port}`);
      console.log("Student authentication: /api/auth");
      console.log("Admin authentication: /api/admin");
      console.log("Food management: /api/foods");
      console.log("Order management: /api/orders");
    });
  } catch (error) {
    console.error("Backend startup failed:", error.message);
    process.exit(1);
  }
}

startServer();