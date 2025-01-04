const express = require("express");
const authMiddleware = require("../../middlewares/auth.middleware.js");
const authorMiddleware = require("../../middlewares/author.middleware.js");
const HelpersController = require("../../controllers/helpers/helpers.controller.js");

const router = express.Router();
router.post(
  "/create_option",
  authMiddleware,
  HelpersController.CreateOption
);
router.post("/options", authMiddleware, HelpersController.GetOptionsByType);

module.exports = router;
