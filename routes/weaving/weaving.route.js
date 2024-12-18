const express = require("express");
const authMiddleware = require("../../middlewares/auth.middleware.js");
const authorMiddleware = require("../../middlewares/author.middleware.js");
const DepWeavingController = require("../../controllers/weaving/weaving.controller.js");

const router = express.Router();
router.get("/weaving_model", DepWeavingController.getModel);
router.post("/weaving_all", authMiddleware, DepWeavingController.getAll);
router.post("/weaving_create", authMiddleware, DepWeavingController.create);
router.delete(
  "/weaving_delete/:id",
  authMiddleware,
  DepWeavingController.delete
);
router.post(
  "/cancel_reason",
  authMiddleware,
  DepWeavingController.cencelReason
);
router.put(
  "/weaving_edit/:id",
  authMiddleware,
  DepWeavingController.edit
);
router.get(
  "/weaving_get_one/:id",
  authMiddleware,
  DepWeavingController.getOne
);
router.post(
  "/weaving_get_inprocess",
  authMiddleware,
  DepWeavingController.getOneFromInProcess
);
router.post(
  "/weaving_get_inprocess",
  authMiddleware,
  DepWeavingController.getOneFromInProcess
);
router.post(
  "/weaving_add_day_report",
  authMiddleware,
  DepWeavingController.addDayReportInProcess
);
router.post(
  "/weaving_get_report",
  authMiddleware,
  DepWeavingController.getDayReportFromWeaving
);
module.exports = router;
