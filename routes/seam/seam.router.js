const express = require("express");
const authMiddleware = require("../../middlewares/auth.middleware.js");
const authorMiddleware = require("../../middlewares/author.middleware.js");
const DepSeamWarehouseController = require("../../controllers/seam/warehouse/warehouse.controller.js");
const SeamInFormController = require("../../controllers/seam/form/form.controller.js");
const SeamInClassificationController = require("../../controllers/seam/classification/classification.controller.js");

const router = express.Router();
router.post(
  "/image_qrcode",
  authMiddleware,
  DepSeamWarehouseController.getQRImage
);
router.post(
  "/generate_qrcode",
  authMiddleware,
  DepSeamWarehouseController.GenerateQRCode
);
router.get(
  "/responsibles_model",
  authMiddleware,
  DepSeamWarehouseController.ResponsiblesModel
);
router.post(
  "/warehouse_create_from",
  authMiddleware,
  DepSeamWarehouseController.CreaetToForm
);
router.post(
  "/warehouse_all_from",
  authMiddleware,
  DepSeamWarehouseController.GetAllForm
);
router.post(
  "/warehouse_model_form",
  authMiddleware,
  DepSeamWarehouseController.GetFormMode
);
router.post("/all_form", authMiddleware, SeamInFormController.getAll);
router.post(
  "/form_create",
  authMiddleware,
  SeamInFormController.CreaetInfoToForm
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
  "/all_classification",
  authMiddleware,
  SeamInClassificationController.getAll
);
router.post(
  "/classification_get_one_report",
  authMiddleware,
  SeamInClassificationController.GetOneReport
);
router.post(
  "/confim_and_create",
  authMiddleware,
  SeamInClassificationController.ConfirmAndCreteProcess
);
router.post(
  "/accept_report_item",
  authMiddleware,
  SeamInClassificationController.AcceptReportItem
);
router.post(
  "/create_day_report_classification",
  authMiddleware,
  SeamInClassificationController.CreateDayReport
);

module.exports = router;
