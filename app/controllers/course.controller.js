const Course = require("../models/course.model");
const Enrollment = require("../models/enrollment.model");
const User = require("../models/user.model");
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

exports.getAll = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    return res.status(200).json(courses);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch courses", error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    return res.status(200).json(course);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch course", error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, description, status, dueDate } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const course = await Course.create({
      title,
      description,
      status: status ?? true,
      dueDate: dueDate || null,
      createdBy: req.userId
    });

    return res.status(201).json(course);
  } catch (err) {
    return res.status(500).json({ message: "Failed to create course", error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    return res.status(200).json(course);
  } catch (err) {
    return res.status(500).json({ message: "Failed to update course", error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    await Enrollment.deleteMany({ course: course._id });
    return res.status(200).json({ message: "Course deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete course", error: err.message });
  }
};

exports.enroll = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const enrollment = await Enrollment.create({
      user: req.userId,
      course: courseId,
      progress: 0,
      completedModules: []
    });

    const user = await User.findById(req.userId).lean();
    if (user) {
      await sendMailSafe({
        to: user.email,
      subject: "Enrollment confirmed",
      text: `You have enrolled in: ${course.title}`
      });
    }

    return res.status(201).json(enrollment);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Already enrolled" });
    }
    return res.status(500).json({ message: "Failed to enroll", error: err.message });
  }
};

exports.myCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.userId })
      .populate("course")
      .sort({ createdAt: -1 });

    const courses = enrollments.map((e) => ({
      course: e.course,
      progress: e.progress,
      completedModules: e.completedModules
    }));
    return res.status(200).json(courses);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch enrollments", error: err.message });
  }
};
exports.updateModuleProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { moduleIndex, completed } = req.body;

    const course = await Course.findById(courseId).select("modules");
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (!Array.isArray(course.modules) || course.modules.length === 0) {
      return res.status(400).json({ message: "Course has no modules" });
    }

    if (moduleIndex < 0 || moduleIndex >= course.modules.length) {
      return res.status(400).json({ message: "Invalid module index" });
    }

    const enrollment = await Enrollment.findOne({ user: req.userId, course: courseId });
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    const set = new Set(enrollment.completedModules || []);
    if (completed) {
      set.add(moduleIndex);
    } else {
      set.delete(moduleIndex);
    }

    const completedModules = Array.from(set).sort((a, b) => a - b);
    const progress = Math.round((completedModules.length / course.modules.length) * 100);

    enrollment.completedModules = completedModules;
    enrollment.progress = progress;
    await enrollment.save();

    return res.status(200).json({
      courseId,
      completedModules,
      progress
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update progress", error: err.message });
  }
};
