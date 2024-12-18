const express = require("express");
const authMiddleware = require("../../middlewares/auth.middleware.js");
const authorMiddleware = require("../../middlewares/author.middleware.js");
const DepProvideController = require("../../controllers/provide/provide.controller.js");

const router = express.Router();
router.post("/provide_all", DepProvideController.getAll);
router.post("/provide_create", authMiddleware, DepProvideController.create);
router.post(
  "/cancel_reason",
  authMiddleware,
  DepProvideController.cencelReason
);
router.post("/delivered", authMiddleware, DepProvideController.Delivered);
// router.delete(
//   "/provide_delete/:id",
//   authMiddleware,
//   DepProvideController.delete
// );
// router.put(
//   "/provide_edit/:id",
//   authMiddleware,
//   authorMiddleware,
//   DepProvideController.edit
// );
router.post("/provide_get_one", authMiddleware, DepProvideController.getOne);
router.post("/confirm", authMiddleware, DepProvideController.Confirm);
module.exports = router;
