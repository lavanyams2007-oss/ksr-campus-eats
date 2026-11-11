
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in."
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const student = await Student.findById(decoded.studentId);

    if (!student) {
      return res.status(401).json({
        success: false,
        message: "Student account not found."
      });
    }

    req.student = student;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please log in again."
    });
  }
};

module.exports = authMiddleware;
