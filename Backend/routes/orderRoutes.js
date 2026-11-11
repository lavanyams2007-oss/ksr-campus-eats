
const express = require("express");
const mongoose = require("mongoose");

const Order = require("../models/Order");
const Food = require("../models/Food");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// STUDENT: PLACE NEW ORDER
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { items, paymentMethod } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain food items."
      });
    }

    if (!["Online", "Counter"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method."
      });
    }

    const cleanItems = [];

    for (const item of items) {
      if (
        !item.foodId ||
        !mongoose.Types.ObjectId.isValid(item.foodId) ||
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid food item or quantity."
        });
      }

      const food = await Food.findById(item.foodId);

      if (!food || !food.isAvailable) {
        return res.status(400).json({
          success: false,
          message: "One or more food items are unavailable."
        });
      }

      cleanItems.push({
        foodId: food._id.toString(),
        name: food.name,
        price: food.price,
        quantity: Number(item.quantity)
      });
    }

    const totalAmount = cleanItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    const order = await Order.create({
      student: req.student._id,
      studentName: req.student.fullName,
      items: cleanItems,
      totalAmount,
      paymentMethod
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      order
    });

  } catch (error) {
    console.error("Create order error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to place order."
    });
  }
});

// STUDENT: GET ONLY THEIR OWN ORDERS
router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({
      student: req.student._id
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders
    });

  } catch (error) {
    console.error("Fetch student orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch orders."
    });
  }
});

// ADMIN: ALL-ORDERS ACCESS NOT ENABLED YET
// Add this endpoint only after implementing real admin authentication.
router.get("/", (req, res) => {
  return res.status(403).json({
    success: false,
    message: "Admin authentication is required."
  });
});

module.exports = router;
