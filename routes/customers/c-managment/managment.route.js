const express = require("express");
const router = express.Router();
const authMiddleware = require("../../../middlewares/auth.middleware.js");
const authorMiddleware = require("../../../middlewares/author.middleware.js");
const onlyAdminAccess = require("../../../middlewares/admin.middleware.js");
const CustomerManagmentController = require("../../../controllers/customers/c-managment/managment.controller.js");

router.post(
  "/managment/create",
  authMiddleware, CustomerManagmentController.Create
);
router.post(
  "/managment/customers",
  authMiddleware, CustomerManagmentController.GetAll
);
router.post(
  "/managment/deleted",
  authMiddleware, CustomerManagmentController.DeleteById
);
router.post(
  "/managment/getone",
  authMiddleware, CustomerManagmentController.GetById
);
router.post(
  "/managment/customerId/orders",
  authMiddleware, CustomerManagmentController.GetOrdersByCustomerId
);



module.exports = router;
