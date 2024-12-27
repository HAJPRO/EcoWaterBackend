const express = require("express");
const authMiddleware = require("../../../middlewares/auth.middleware.js");
const authorMiddleware = require("../../../middlewares/author.middleware.js");
const SeamInClassificationController = require("../../../controllers/seam/classification/classification.controller.js");

const router = express.Router();
router.post("/all", authMiddleware, SeamInClassificationController.getAll);
router.post(
  "/get_one_report",
  authMiddleware,
  SeamInClassificationController.GetOneReport
);
router.post(
  "confim_and_create",
  authMiddleware,
  SeamInClassificationController.ConfirmAndCreteProcess
);
router.post(
  "/accept_report_item",
  authMiddleware,
  SeamInClassificationController.AcceptReportItem
);
router.post(
  "/create_day_report",
  authMiddleware,
  SeamInClassificationController.CreateDayReport
);

module.exports = router;
