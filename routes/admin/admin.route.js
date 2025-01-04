const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/auth.middleware.js");
const authorMiddleware = require("../../middlewares/author.middleware.js");
const onlyAdminAccess = require("../../middlewares/admin.middleware.js");

const PermissionController = require("../../controllers/admin/permission.controller.js");
const RoleController = require("../../controllers/admin/role.controller.js");
const UserController = require("../../controllers/admin/User.controller.js");
const {
  permissionAddValidator,
} = require("../../helpers/admin/permissionValidator");

router.post(
  "/create_permission",
  authMiddleware,
  onlyAdminAccess,
  permissionAddValidator,
  PermissionController.addPermission
);
router.post(
  "/create_role",
  authMiddleware,
  onlyAdminAccess,
  permissionAddValidator,
  RoleController.CreateRole
);
router.post(
  "/create_user",
  authMiddleware,
  onlyAdminAccess,
  UserController.createUser
);
router.post(
  "/update_user",
  authMiddleware,
  onlyAdminAccess,
  UserController.UpdateUser
);
router.post("/users", authMiddleware, onlyAdminAccess, UserController.GetUsers);
router.post(
  "/user",
  authMiddleware,
  onlyAdminAccess,
  UserController.GetOneUser
);
router.post("/roles", authMiddleware, onlyAdminAccess, UserController.GetRoles);
router.post(
  "/permissions",
  authMiddleware,
  onlyAdminAccess,
  UserController.GetPermissions
);

module.exports = router;
