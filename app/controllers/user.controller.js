const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const mailConfig = require("../config/mail.config");

const getMailer = () => {
  if (!mailConfig.user || !mailConfig.pass) return null;

  return nodemailer.createTransport({
    host: mailConfig.host,
    port: mailConfig.port,
    secure: mailConfig.secure,
    auth: { user: mailConfig.user, pass: mailConfig.pass }
  });
};

const sendMailSafe = async (options) => {
  const transporter = getMailer();
  if (!transporter) return;

  try {
    await transporter.sendMail({ from: mailConfig.from, ...options });
  } catch (err) {
    console.warn("Email send failed:", err.message);
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch profile", error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = { ...req.body };

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    if (updates.email) {
      updates.email = updates.email.toLowerCase();
    }

    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
      runValidators: true
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await sendMailSafe({
      to: user.email,
      subject: "Profile updated",
      text: "Your profile details were updated. If this was not you, contact support."
    });

    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ message: "Failed to update profile", error: err.message });
  }
};
