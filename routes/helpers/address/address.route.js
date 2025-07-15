const express = require("express");
const router = express.Router();
const authMiddleware = require("../../../middlewares/auth.middleware.js");
const authorMiddleware = require("../../../middlewares/author.middleware.js");
const onlyAdminAccess = require("../../../middlewares/admin.middleware.js");
const AddressController = require("../../../controllers/helpers/address/address.controller.js");



router.post(
  "/regions",
  authMiddleware, AddressController.Regions
);
router.post(
  "/districts",
  authMiddleware, AddressController.Districts
);
router.post(
  "/neighborhoods",
  authMiddleware, AddressController.Neighborhoods
);


module.exports = router;
