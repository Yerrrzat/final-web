const express = require("express");
const controller = require("../controllers/course.controller");
const { verifyToken } = require("../middlewares/authJwt");
const { validate } = require("../middlewares/validate");
const { moduleProgressSchema } = require("../validators/enrollment.validator");

const router = express.Router();

router.post("/enroll/:courseId", verifyToken, controller.enroll);
router.get("/my-courses", verifyToken, controller.myCourses);
router.put("/my-courses/:courseId/modules", verifyToken, validate(moduleProgressSchema), controller.updateModuleProgress);

module.exports = router;