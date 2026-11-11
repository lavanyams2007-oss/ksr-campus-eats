
const express = require("express");
const Food = require("../models/Food");

const router = express.Router();

// GET: Fetch all food items
router.get("/", async (req, res) => {
  try {
    const foods = await Food.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: foods.length,
      foods
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch food items.",
      error: error.message
    });
  }
});

// GET: Fetch one food item
router.get("/:id", async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found."
      });
    }

    res.json({ success: true, food });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid food ID."
    });
  }
});

// POST: Add new food
router.post("/", async (req, res) => {
  try {
    const { name, category, price, description, image, isAvailable } = req.body;

    const food = await Food.create({
      name,
      category,
      price,
      description,
      image,
      isAvailable
    });

    res.status(201).json({
      success: true,
      message: "Food added successfully!",
      food
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Unable to add food.",
      error: error.message
    });
  }
});

// PUT: Update food
router.put("/:id", async (req, res) => {
  try {
    const food = await Food.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found."
      });
    }

    res.json({
      success: true,
      message: "Food updated successfully!",
      food
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Unable to update food.",
      error: error.message
    });
  }
});

// DELETE: Remove food
router.delete("/:id", async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found."
      });
    }

    res.json({
      success: true,
      message: "Food deleted successfully!"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Unable to delete food."
    });
  }
});

module.exports = router;
