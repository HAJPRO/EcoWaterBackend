const express = require("express");
const authMiddleware = require("../../../middlewares/auth.middleware.js");
const authorMiddleware = require("../../../middlewares/author.middleware.js");
const FormWarehouseController = require("../../../controllers/seam/form-warehouse/warehouse.controller.js");

const router = express.Router();
router.post("/all", authMiddleware, FormWarehouseController.GetAll);
router.post("/create", authMiddleware, FormWarehouseController.Create);

module.exports = router;
