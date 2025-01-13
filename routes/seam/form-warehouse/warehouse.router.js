const express = require("express");
const authMiddleware = require("../../../middlewares/auth.middleware.js");
const authorMiddleware = require("../../../middlewares/author.middleware.js");
const FormWarehouseController = require("../../../controllers/seam/form-warehouse/warehouse.controller.js");

const router = express.Router();
router.post("/all", authMiddleware, FormWarehouseController.GetAll);
router.post(
  "/accept_and_create",
  authMiddleware,
  FormWarehouseController.AcceptAndCreate
);
router.post("/get_one", authMiddleware, FormWarehouseController.GetOne);
router.post(
  "/create_output",
  authMiddleware,
  FormWarehouseController.CreateOutput
);

module.exports = router;
