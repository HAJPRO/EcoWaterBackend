const express = require("express");
const authMiddleware = require("../../../middlewares/auth.middleware.js");
const authorMiddleware = require("../../../middlewares/author.middleware.js");
const HRAppealsController = require("../../../controllers/hr/appeals/appeals.controller.js");

const router = express.Router();
router.post("/appeals/all", authMiddleware, HRAppealsController.GetAll);

module.exports = router;
