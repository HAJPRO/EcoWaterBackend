const express = require("express");
const authMiddleware = require("../../../middlewares/auth.middleware.js");
const authorMiddleware = require("../../../middlewares/author.middleware.js");
const SeamInPatoksController = require("../../../controllers/seam/patoks/patoks.controller.js");

const router = express.Router();
router.post("/all_patoks", authMiddleware, SeamInPatoksController.getAll);
router.post(
  "/get_one_report",
  authMiddleware,
  SeamInPatoksController.GetOneReport
);
router.post(
  "/confirm_and_create",
  authMiddleware,
  SeamInPatoksController.ConfirmAndCreteProcess
);
router.post(
  "/accept_report_item",
  authMiddleware,
  SeamInPatoksController.AcceptReportItem
);
router.post(
  "/create_day_report",
  authMiddleware,
  SeamInPatoksController.CreateDayReport
);
module.exports = router;
