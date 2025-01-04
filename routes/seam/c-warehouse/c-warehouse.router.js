const express = require("express");
const authMiddleware = require("../../../middlewares/auth.middleware.js");
const authorMiddleware = require("../../../middlewares/author.middleware.js");
const SeamInCWarehouseController = require("../../../controllers/seam/c-warehouse/c-warehouse.controller.js");

const router = express.Router();
router.post("/all", authMiddleware, SeamInCWarehouseController.getAll);
// router.post(
//   "/get_one_report",
//   authMiddleware,
//   SeamInPackingController.GetOneReport
// );
router.post(
  "/confirm_and_create",
  authMiddleware,
  SeamInCWarehouseController.ConfirmAndCreateInProcess
);
// router.post(
//   "/accept_report_item",
//   authMiddleware,
//   SeamInPackingController.AcceptReportItem
// );
// router.post(
//   "/create_day_report",
//   authMiddleware,
//   SeamInPackingController.CreateDayReport
// );
module.exports = router;
