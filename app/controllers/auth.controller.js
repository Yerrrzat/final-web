const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authConfig = require("../config/auth.config");
const mailConfig = require("../config/mail.config");
const User = require("../models/user.model");
const nodemailer = require("nodemailer");

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

exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, and password are required" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password: hashed,
      role: role || "user"
    });

    await sendMailSafe({
      to: user.email,
      subject: "Welcome to Online Courses",
      text: `Hi ${user.username}, your account has been created successfully.`
    });

    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Registration failed", error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, authConfig.secret, {
      expiresIn: authConfig.expiresIn
    });

    return res.status(200).json({
      token,
      user: user.toJSON()
    });
  } catch (err) {
    return res.status(500).json({ message: "Login failed", error: err.message });
  }
};