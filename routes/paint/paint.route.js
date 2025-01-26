const express = require("express");
const authMiddleware = require("../../middlewares/auth.middleware.js");
const authorMiddleware = require("../../middlewares/author.middleware.js");
const DepPaintController = require("../../controllers/paint/paint.controller.js");

const router = express.Router();
router.get("/paint_model", DepPaintController.getModel);
router.post("/get_all", authMiddleware, DepPaintController.getAll);
router.post(
  "/get_one_order_report",
  authMiddleware,
  DepPaintController.GetOneOrderReport
);
router.post(
  "/get_one_from_sale",
  authMiddleware,
  DepPaintController.GetOneFromSale
);
router.post(
  "/accept_and_create",
  authMiddleware,
  DepPaintController.AcceptAndCreate
);
router.post(
  "/create_day_report",
  authMiddleware,
  DepPaintController.CreateDayReport
);
router.post("/get_day_report", authMiddleware, DepPaintController.GetDayReport);
router.post(
  "/paint_confirmed_orders",
  authMiddleware,
  DepPaintController.PaintConfirmedOrders
);
router.post("/paint_create", authMiddleware, DepPaintController.create);
router.delete(
  "/paint_delete/:id",
  authMiddleware,
  authorMiddleware,
  DepPaintController.delete
);
router.put(
  "/paint_edit/:id",
  authMiddleware,
  authorMiddleware,
  DepPaintController.edit
);
router.get("/paint_get-one/:id", authMiddleware, DepPaintController.getOne);
router.post(
  "/paint_get_inprocess",
  authMiddleware,
  DepPaintController.getOneFromInProcess
);
router.post(
  "/paint_add_day_report",
  authMiddleware,
  DepPaintController.addDayReportInProcess
);
router.post(
  "/paint_get_report",
  authMiddleware,
  DepPaintController.getDayReportFromPaint
);
router.post("/report_finish", authMiddleware, DepPaintController.Finish);

module.exports = router;
