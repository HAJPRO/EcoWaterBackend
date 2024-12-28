const express = require("express");
const authMiddleware = require("../../../middlewares/auth.middleware.js");
const authorMiddleware = require("../../../middlewares/author.middleware.js");
const SeamInPackingController = require("../../../controllers/seam/packing/packing.controller.js");

const router = express.Router();
router.post("/all_packing", authMiddleware, SeamInPackingController.getAll);
router.post(
  "/get_one_report",
  authMiddleware,
  SeamInPackingController.GetOneReport
);
router.post(
  "/confirm_and_create",
  authMiddleware,
  SeamInPackingController.ConfirmAndCreteProcess
);
router.post(
  "/accept_report_item",
  authMiddleware,
  SeamInPackingController.AcceptReportItem
);
router.post(
  "/create_day_report",
  authMiddleware,
  SeamInPackingController.CreateDayReport
);
module.exports = router;
