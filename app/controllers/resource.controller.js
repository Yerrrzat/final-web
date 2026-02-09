const Course = require("../models/course.model");
const Enrollment = require("../models/enrollment.model");

exports.getAll = async (req, res, next) => {
  try {
    const courses = await Course.find()
      .select("title description status dueDate")
      .sort({ createdAt: -1 });
    return res.status(200).json(courses);
  } catch (err) {
    return next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Resource not found" });
    }

    return res.status(200).json(course);
  } catch (err) {
    return next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { title, description, content, status, dueDate } = req.body;
    const course = await Course.create({
      title,
      description,
      content: content || "",
      status: status ?? true,
      dueDate: dueDate || null,
      createdBy: req.userId
    });

    return res.status(201).json(course);
  } catch (err) {
    return next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!course) {
      return res.status(404).json({ message: "Resource not found" });
    }

    return res.status(200).json(course);
  } catch (err) {
    return next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Resource not found" });
    }

    await Enrollment.deleteMany({ course: course._id });
    return res.status(200).json({ message: "Resource deleted" });
  } catch (err) {
    return next(err);
  }
};