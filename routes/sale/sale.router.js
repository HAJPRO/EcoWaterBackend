const express = require("express");
const authMiddleware = require("../../middlewares/auth.middleware.js");
const authorMiddleware = require("../../middlewares/author.middleware.js");
const SaleCardController = require("../../controllers/Sale/salecard.controller.js");

const router = express.Router();

router.get("/get_card_model", SaleCardController.GetCardModel);
router.post("/legal_proccess/:id", SaleCardController.AllOrderProccessById);
router.post("/all", authMiddleware, SaleCardController.getAll);
router.post(
    "/legal_all_length",
    authMiddleware,
    SaleCardController.getAllLength
);
router.post("/weaving_all", SaleCardController.getAllWeaving);
router.post("/create", authMiddleware, SaleCardController.create);
router.delete("/legal_delete/:id", authMiddleware, SaleCardController.delete);
router.post("/legal_confirm", SaleCardController.confirm);
router.post("/legal_export_excel", SaleCardController.export_excel);
router.put(
    "/legal_edit/:id",
    authMiddleware,
    authorMiddleware,
    SaleCardController.edit
);
router.get("/legal_get_one/:id", authMiddleware, SaleCardController.getOne);

module.exports = router;
