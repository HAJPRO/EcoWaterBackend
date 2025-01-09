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
router.post("/create", authMiddleware, DepSeamWarehouseController.Create);
router.post("/all", authMiddleware, DepSeamWarehouseController.GetAll);
router.post("/get_one", authMiddleware, DepSeamWarehouseController.GetOne);
router.post("/get_model", authMiddleware, DepSeamWarehouseController.GetModel);

module.exports = router;
