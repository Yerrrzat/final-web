const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    content: { type: String, default: "", trim: true },
    modules: [
      {
        title: { type: String, required: true, trim: true },
        summary: { type: String, default: "", trim: true },
        task: { type: String, default: "", trim: true }
      }
    ],
    status: { type: Boolean, default: true },
    dueDate: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", CourseSchema);
