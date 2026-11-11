
const express = require("express");
const mongoose = require("mongoose");

const Order = require("../models/Order");
const adminAuthMiddleware = require("../middleware/adminAuthMiddleware");

const router = express.Router();

// GET: Fetch all student orders (admin only)
router.get("/", adminAuthMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error("Admin fetch orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders."
    });
  }
});

// PATCH: Update an order's status (admin only)
router.patch("/:id/status", adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    const allowedStatuses = [
      "Pending",
      "Preparing",
      "Ready",
      "Completed",
      "Cancelled"
    ];

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID."
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status.",
        allowedStatuses
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      order
    });
  } catch (error) {
    console.error("Admin update order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update order status."
    });
  }
});

module.exports = router;
