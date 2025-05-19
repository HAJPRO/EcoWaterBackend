const express = require("express");
const authController = require("../controllers/auth.controller.js");
// const { body } = require("express-validator");
const authMiddleware = require("../middlewares/auth.middleware.js");

const router = express.Router();

router.post("/register", authMiddleware, authController.register);
router.get("/activation/:id", authMiddleware, authController.activation);
router.post("/login", authMiddleware, authController.login);
router.post("/update", authMiddleware, authController.update);
router.post("/logout", authMiddleware, authController.logout);
router.get("/refresh", authMiddleware, authController.refresh);
router.get("/get-users", authMiddleware, authController.getUser);

module.exports = router;
