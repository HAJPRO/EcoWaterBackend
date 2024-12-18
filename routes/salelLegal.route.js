const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware.js");
const authorMiddleware = require("../middlewares/author.middleware.js");
const saleLegalController = require("../controllers/saleLegal.controller.js");

const router = express.Router();
router.get("/legal_model", saleLegalController.getModel);
router.post("/legal_proccess/:id", saleLegalController.AllOrderProccessById);
router.post("/legal_all", authMiddleware, saleLegalController.getAll);
router.post("/legal_all_length", authMiddleware, saleLegalController.getAllLength);
router.post("/weaving_all", saleLegalController.getAllWeaving);
router.post("/legal_create", authMiddleware, saleLegalController.create);
router.delete("/legal_delete/:id", authMiddleware, saleLegalController.delete);
router.post("/legal_confirm", saleLegalController.confirm);
router.post("/legal_export_excel", saleLegalController.export_excel);
router.put("/legal_edit/:id", authMiddleware, authorMiddleware, saleLegalController.edit);
router.get("/legal_get_one/:id", authMiddleware, saleLegalController.getOne);

module.exports = router;
