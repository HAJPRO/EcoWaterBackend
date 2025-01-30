const express = require("express");
const authMiddleware = require("../../middlewares/auth.middleware.js");
const authorMiddleware = require("../../middlewares/author.middleware.js");
const DepSpinningController = require("../../controllers/spinning/spinning.controller");

const router = express.Router();
router.get("/spinning_model", DepSpinningController.getModel);
router.post("/spinning_all", authMiddleware, DepSpinningController.getAll);
router.post(
  "/accept_and_create",
  authMiddleware,
  DepSpinningController.AcceptAndCreate
);
router.post(
  "/create_day_report",
  authMiddleware,
  DepSpinningController.CreateDayReport
);
router.post(
  "/get_day_report",
  authMiddleware,
  DepSpinningController.GetDayReport
);
router.post(
  "/get_one_from_weaving",
  authMiddleware,
  DepSpinningController.GetOneFromWeaving
);
module.exports = router;
