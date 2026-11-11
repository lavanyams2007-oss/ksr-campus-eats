
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    items: [
      {
        foodId: String,
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Pending", "Preparing", "Ready", "Completed", "Cancelled"],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      enum: ["Online", "Counter"],
      default: "Counter",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
