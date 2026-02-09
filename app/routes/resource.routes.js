const express = require("express");
const controller = require("../controllers/resource.controller");
const { verifyToken, requireRole } = require("../middlewares/authJwt");
const { validate } = require("../middlewares/validate");
const { resourceCreateSchema, resourceUpdateSchema } = require("../validators/resource.validator");

const router = express.Router();

router.get("/resource/public", controller.getAll);
router.get("/resource", verifyToken, controller.getAll);
router.get("/resource/:id", verifyToken, controller.getById);

router.post("/resource", verifyToken, requireRole(["admin", "moderator"]), validate(resourceCreateSchema), controller.create);
router.put("/resource/:id", verifyToken, requireRole(["admin", "moderator"]), validate(resourceUpdateSchema), controller.update);
router.delete("/resource/:id", verifyToken, requireRole(["admin"]), controller.remove);

module.exports = router;