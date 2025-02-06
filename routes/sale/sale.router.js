const express = require("express");
const authMiddleware = require("../../middlewares/auth.middleware.js");
const authorMiddleware = require("../../middlewares/author.middleware.js");
const SaleCardController = require("../../controllers/Sale/salecard.controller.js");

const router = express.Router();

router.get("/get_card_model", SaleCardController.GetCardModel);
router.post("/get_proccess_status", SaleCardController.AllOrderProccessById);
router.post("/all", authMiddleware, SaleCardController.getAll);
router.post(
  "/legal_all_length",
  authMiddleware,
  SaleCardController.getAllLength
);
router.post("/weaving_all", SaleCardController.getAllWeaving);
router.post("/create", authMiddleware, SaleCardController.create);
router.post("/update_card", authMiddleware, SaleCardController.UpdateById);
router.delete("/legal_delete/:id", authMiddleware, SaleCardController.delete);
router.post("/confirm", authMiddleware, SaleCardController.confirm);
router.post("/legal_export_excel", SaleCardController.export_excel);
router.put(
  "/legal_edit/:id",
  authMiddleware,
  authorMiddleware,
  SaleCardController.edit
);
router.post("/get_one", authMiddleware, SaleCardController.GetOne);
router.post("/finish_party", authMiddleware, SaleCardController.FinishParty);

module.exports = router;
