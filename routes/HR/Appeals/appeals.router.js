const express = require("express");
const authMiddleware = require("../../../middlewares/auth.middleware.js");
const authorMiddleware = require("../../../middlewares/author.middleware.js");
const HRAppealsController = require("../../../controllers/hr/appeals/appeals.controller.js");

const router = express.Router();
router.post("/all", authMiddleware, HRAppealsController.GetAll);
router.post(
  "/reply_message",
  authMiddleware,
  HRAppealsController.ReplyMessageCreate
);
router.post("/delete", authMiddleware, HRAppealsController.Delete);

module.exports = router;
