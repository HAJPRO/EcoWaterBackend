const express = require("express");
const authMiddleware = require("../../../middlewares/auth.middleware.js");
const authorMiddleware = require("../../../middlewares/author.middleware.js");
const DepSeamWarehouseController = require("../../../controllers/seam/warehouse/warehouse.controller.js");

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
  "/create_from",
  authMiddleware,
  DepSeamWarehouseController.CreaetToForm
);
router.post("/all_from", authMiddleware, DepSeamWarehouseController.GetAllForm);
router.post(
  "/model_form",
  authMiddleware,
  DepSeamWarehouseController.GetFormMode
);

module.exports = router;
