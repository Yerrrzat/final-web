const express = require("express");
const controller = require("../controllers/course.controller");
const { verifyToken, requireRole } = require("../middlewares/authJwt");

const router = express.Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);

router.post("/", verifyToken, requireRole(["admin"]), controller.create);
router.put("/:id", verifyToken, requireRole(["admin"]), controller.update);
router.delete("/:id", verifyToken, requireRole(["admin"]), controller.remove);

module.exports = router;
