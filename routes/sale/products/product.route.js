const express = require("express");
const router = express.Router();
const authMiddleware = require("../../../middlewares/auth.middleware.js");
const authorMiddleware = require("../../../middlewares/author.middleware.js");
const onlyAdminAccess = require("../../../middlewares/admin.middleware.js");
const ProductManagmentController = require("../../../controllers/sale/products/product.controller.js");

router.post(
  "/managment/create",
  authMiddleware, ProductManagmentController.Create
);
router.post(
  "/managment/all",
  authMiddleware, ProductManagmentController.GetAll
);
router.post(
  "/managment/getone",
  authMiddleware, ProductManagmentController.GetOne
);
router.post(
  "/managment/delete",
  authMiddleware, ProductManagmentController.DeleteById
);



module.exports = router;
