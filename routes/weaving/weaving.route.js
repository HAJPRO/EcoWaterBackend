const express = require("express");
const authMiddleware = require("../../middlewares/auth.middleware.js");
const authorMiddleware = require("../../middlewares/author.middleware.js");
const DepWeavingController = require("../../controllers/weaving/weaving.controller.js");

const router = express.Router();
router.get("/weaving_model", DepWeavingController.getModel);
router.post("/weaving_all", authMiddleware, DepWeavingController.getAll);
router.post(
  "/accept_and_create",
  authMiddleware,
  DepWeavingController.AcceptAndCreate
);
router.delete(
  "/weaving_delete/:id",
  authMiddleware,
  DepWeavingController.delete
);

router.put("/weaving_edit/:id", authMiddleware, DepWeavingController.edit);
router.post(
  "/get_one_from_paint",
  authMiddleware,
  DepWeavingController.GetOneFromPaint
);

module.exports = router;
