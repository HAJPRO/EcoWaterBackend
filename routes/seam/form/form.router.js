const express = require("express");
const authMiddleware = require("../../../middlewares/auth.middleware.js");
const authorMiddleware = require("../../../middlewares/author.middleware.js");
const SeamInFormController = require("../../../controllers/seam/form/form.controller.js");

const router = express.Router();
router.post("/all", authMiddleware, SeamInFormController.getAll);
router.post(
  "/accept_and_create",
  authMiddleware,
  SeamInFormController.AcceptAndCreate
);
router.post(
  "/create_day_report",
  authMiddleware,
  SeamInFormController.CreateDayReport
);
router.post(
  "/get_one_report",
  authMiddleware,
  SeamInFormController.GetOneReport
);
router.post(
  "/get_one_report_products",
  authMiddleware,
  SeamInFormController.GetOneReportPastal
);
router.post(
  "/get_for_update",
  authMiddleware,
  SeamInFormController.GetOneForUpdate
);
router.post("/update", authMiddleware, SeamInFormController.Update);

module.exports = router;
