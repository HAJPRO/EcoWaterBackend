const express = require("express");
const router = express.Router();
const authMiddleware = require("../../../middlewares/auth.middleware.js");
const authorMiddleware = require("../../../middlewares/author.middleware.js");
const onlyAdminAccess = require("../../../middlewares/admin.middleware.js");
const EmployeeManagmentController = require("../../../controllers/hr/employee/employee.controller.js");

router.post(
    "/managment/create",
    authMiddleware, EmployeeManagmentController.Create
);
router.post(
    "/managment/all",
    authMiddleware, EmployeeManagmentController.GetAll
);
router.post(
    "/managment/deleted",
    authMiddleware, EmployeeManagmentController.DeleteById
);
router.post(
    "/managment/getone",
    authMiddleware, EmployeeManagmentController.GetById
);
router.post(
    "/managment/driverId/orders",
    authMiddleware, EmployeeManagmentController.GetOrdersByDriverId
);



module.exports = router;
