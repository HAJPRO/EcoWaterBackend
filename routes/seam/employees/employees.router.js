const express = require("express");
const authMiddleware = require("../../../middlewares/auth.middleware.js");
const authorMiddleware = require("../../../middlewares/author.middleware.js");
const SeamEmployeesController = require("../../../controllers/seam/employees/employees.controller.js");

const router = express.Router();
router.post("/all", authMiddleware, SeamEmployeesController.getAll);
router.post(
  "/get_one_employee_reports",
  authMiddleware,
  SeamEmployeesController.getOneEployeeReport
);
router.post(
  "/confirm_and_reply",
  authMiddleware,
  SeamEmployeesController.ConfirmReportAndSendReply
);

module.exports = router;
