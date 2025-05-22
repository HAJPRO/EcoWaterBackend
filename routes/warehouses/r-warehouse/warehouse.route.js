const express = require("express");
const router = express.Router();
const authMiddleware = require("../../../middlewares/auth.middleware.js");
const authorMiddleware = require("../../../middlewares/author.middleware.js");
const onlyAdminAccess = require("../../../middlewares/admin.middleware.js");
const ReadyWarehouseController = require("../../../controllers/warehouses/r-warehouse/warehouse.controller.js");
router.post(
  "/r-warehouse/model",
  authMiddleware, ReadyWarehouseController.GetModel
);
router.post(
  "/r-warehouse/create",
  authMiddleware, ReadyWarehouseController.Create
);
router.post(
  "/r-warehouse/all",
  authMiddleware, ReadyWarehouseController.GetAll
);
router.post(
  "/r-warehouse/getone",
  authMiddleware, ReadyWarehouseController.GetOne
);
router.post(
  "/r-warehouse/output",
  authMiddleware, ReadyWarehouseController.OutputProduct
);


module.exports = router;
