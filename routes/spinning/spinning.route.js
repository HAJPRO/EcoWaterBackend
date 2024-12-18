const express = require("express");
const authMiddleware = require("../../middlewares/auth.middleware.js");
const authorMiddleware = require("../../middlewares/author.middleware.js");
const DepSpinningController = require("../../controllers/spinning/spinning.controller");

const router = express.Router();
router.get("/spinning_model", DepSpinningController.getModel);
router.post("/spinning_all", authMiddleware, DepSpinningController.getAll);
router.post("/spinning_create", authMiddleware, DepSpinningController.create);
router.delete(
  "/spinning_delete/:id",
  authMiddleware,
  DepSpinningController.delete
);
router.post(
  "/cancel_reason",
  authMiddleware,
  DepSpinningController.cencelReason
);
router.put(
  "/spinning_edit/:id",
  authMiddleware,
  authorMiddleware,
  DepSpinningController.edit
);
router.post(
  "/spinning_get_one",
  authMiddleware,
  DepSpinningController.getOne
);
router.post(
  "/spinning_get_inprocess",
  authMiddleware,
  DepSpinningController.getOneFromInProcess
);
router.post(
  "/spinning_add_day_report",
  authMiddleware,
  DepSpinningController.addDayReportInProcess
);
// router.post(
//   "/spinning_get_report",
//   authMiddleware,
//   DepSpinningController.getDayReportFromWeaving
// );

module.exports = router;
