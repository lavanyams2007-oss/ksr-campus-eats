const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");

const router = express.Router();

// STUDENT REGISTRATION
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, studentId, password } = req.body || {};

    if (
      typeof fullName !== "string" ||
      typeof email !== "string" ||
      typeof studentId !== "string" ||
      typeof password !== "string" ||
      !fullName.trim() ||
      !email.trim() ||
      !studentId.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Please fill in all required fields."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedStudentId = studentId.trim();

    const existingStudent = await Student.findOne({
      $or: [
        { email: normalizedEmail },
        { studentId: normalizedStudentId }
      ]
    });

    if (existingStudent) {
      return res.status(409).json({
        message: "Email or Student ID is already registered."
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const student = await Student.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      studentId: normalizedStudentId,
      passwordHash
    });

    return res.status(201).json({
      message: "Registration successful. Please sign in.",
      student: {
        id: student._id,
        fullName: student.fullName,
        email: student.email,
        studentId: student.studentId
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email or Student ID is already registered."
      });
    }

    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Registration failed. Please try again."
    });
  }
});

// STUDENT LOGIN: EMAIL OR STUDENT ID
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body || {};

    if (
      typeof identifier !== "string" ||
      typeof password !== "string" ||
      !identifier.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Enter your email or Student ID and password."
      });
    }

    const value = identifier.trim();

    const student = await Student.findOne({
      $or: [
        { email: value.toLowerCase() },
        { studentId: value }
      ]
    }).select("+passwordHash");

    if (!student) {
      return res.status(401).json({
        message: "Invalid login credentials."
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      student.passwordHash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid login credentials."
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing from the backend .env file.");

      return res.status(500).json({
        message: "Server authentication is not configured."
      });
    }

    const token = jwt.sign(
      { studentId: student._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful.",
      token,
      student: {
        id: student._id,
        fullName: student.fullName,
        email: student.email,
        studentId: student.studentId
      }
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Login failed. Please try again."
    });
  }
});

module.exports = router;               