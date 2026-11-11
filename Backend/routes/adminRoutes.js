const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!adminEmail || !adminPasswordHash) {
      return res.status(500).json({
        success: false,
        message: "Admin credentials are not configured."
      });
    }

    if (
      !email ||
      email.toLowerCase().trim() !== adminEmail.toLowerCase().trim()
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin email or password."
      });
    }

    const passwordMatches = await bcrypt.compare(
      password || "",
      adminPasswordHash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin email or password."
      });
    }

    const token = jwt.sign(
      { role: "admin", email: adminEmail },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    return res.json({
      success: true,
      message: "Admin login successful.",
      token,
      admin: { email: adminEmail }
    });
  } catch (error) {
    console.error("Admin login error:", error);

    return res.status(500).json({
      success: false,
      message: "Admin login failed."
    });
  }
});

module.exports = router;