const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/auth.middleware.js");
const authorMiddleware = require("../../middlewares/author.middleware.js");
const onlyAdminAccess = require("../../middlewares/admin.middleware.js");

const PermissionController = require("../../controllers/admin/permission.controller.js");
const {
    permissionAddValidator,
} = require("../../helpers/admin/permissionValidator");

router.post(
    "/create",
    authMiddleware,
    PermissionController.CreatePermission
);
router.post(
    "/all",
    authMiddleware,
    PermissionController.GetAll
);

module.exports = router;
