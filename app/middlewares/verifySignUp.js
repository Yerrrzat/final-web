const User = require("../models/user.model");

const checkDuplicateEmail = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const existing = await User.findOne({ email: email.toLowerCase() }).lean();
  if (existing) {
    return res.status(409).json({ message: "Email is already in use" });
  }

  return next();
};

const checkValidRole = (req, res, next) => {
  const { role } = req.body;
  const allowed = ["admin", "user", "premium", "moderator"];
  if (role && !allowed.includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }
  return next();
};

module.exports = {
  checkDuplicateEmail,
  checkValidRole
};
