const express = require("express");
const authMiddleware = require("../../../middlewares/auth.middleware.js");
const authorMiddleware = require("../../../middlewares/author.middleware.js");
const SeamInFormController = require("../../../controllers/seam/form/form.controller.js");

const router = express.Router();
router.post("/all", authMiddleware, SeamInFormController.getAll);
router.post("/create", authMiddleware, SeamInFormController.CreaetInfoToForm);
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

module.exports = router;
