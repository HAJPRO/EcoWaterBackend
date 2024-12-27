const express = require("express");
const authMiddleware = require("../../../middlewares/auth.middleware.js");
const authorMiddleware = require("../../../middlewares/author.middleware.js");
const SeamInPatoksController = require("../../../controllers/seam/patoks/patoks.controller.js");

const router = express.Router();
router.post("/all_patoks", authMiddleware, SeamInPatoksController.getAll);

module.exports = router;
