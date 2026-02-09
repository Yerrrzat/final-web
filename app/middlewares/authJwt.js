const jwt = require("jsonwebtoken");
const authConfig = require("../config/auth.config");
const User = require("../models/user.model");

const verifyToken = async (req, res, next) => {
  const token = req.headers["x-access-token"] || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, authConfig.secret);
    req.userId = decoded.id;

    const user = await User.findById(decoded.id).select("role");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.userRole = user.role;
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

const requireRole = (roles = []) => (req, res, next) => {
  if (!roles.includes(req.userRole)) {
    return res.status(403).json({ message: "Forbidden: insufficient role" });
  }
  return next();
};

module.exports = {
  verifyToken,
  requireRole
};