
const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Food name is required"],
      trim: true
    },

    category: {
      type: String,
      required: [true, "Food category is required"],
      enum: [
        "Breakfast",
        "Lunch",
        "Snacks",
        "Dinner",
        "Drinks",
        "Desserts"
      ]
    },

    price: {
      type: Number,
      required: [true, "Food price is required"],
      min: [0, "Price cannot be negative"]
    },

    description: {
      type: String,
      trim: true,
      default: ""
    },

    image: {
      type: String,
      default: ""
    },

    isAvailable: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Food", foodSchema);
