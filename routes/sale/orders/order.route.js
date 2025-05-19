const express = require("express");
const router = express.Router();
const authMiddleware = require("../../../middlewares/auth.middleware.js");
const authorMiddleware = require("../../../middlewares/author.middleware.js");
const onlyAdminAccess = require("../../../middlewares/admin.middleware.js");
const OrderManagmentController = require("../../../controllers/sale/orders/order.controller.js");

router.post(
  "/managment/create",
  authMiddleware, OrderManagmentController.Create
);
router.post(
  "/managment/getone",
  authMiddleware, OrderManagmentController.OrderGetById
);
router.post(
  "/managment/all",
  authMiddleware, OrderManagmentController.GetAll
);
router.post(
  "/managment/update",
  authMiddleware, OrderManagmentController.UpdateById
);
router.post(
  "/managment/drivers",
  authMiddleware, OrderManagmentController.GetAllDrivers
);
//   router.post(
//     "/managment/getone",
//     authMiddleware, CustomerManagmentController.GetById
//   );



module.exports = router;
