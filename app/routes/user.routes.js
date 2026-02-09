const express = require("express");
const controller = require("../controllers/user.controller");
const { verifyToken } = require("../middlewares/authJwt");
const { validate } = require("../middlewares/validate");
const { profileSchema } = require("../validators/user.validator");

const router = express.Router();

router.get("/users/profile", verifyToken, controller.getProfile);
router.put("/users/profile", verifyToken, validate(profileSchema), controller.updateProfile);

module.exports = router;