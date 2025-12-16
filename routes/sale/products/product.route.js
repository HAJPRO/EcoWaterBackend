const express = require("express");
const router = express.Router();

// Middlewarelar
const authMiddleware = require("../../../middlewares/auth.middleware.js");
const authorMiddleware = require("../../../middlewares/author.middleware.js");
const onlyAdminAccess = require("../../../middlewares/admin.middleware.js");

// Controller
const ProductManagmentController = require("../../../controllers/sale/products/product.controller.js");

// --- 1. Umumiy operatsiyalar (Root URL) ---

// Yaratish (Create) -> POST /
router.post(
  "/", 
  authMiddleware, 
  // authorMiddleware, // Agar faqat mualliflar yarata olsa, buni qo'shing
  ProductManagmentController.create
);

// Hammasini olish (Get All + Search + Filter) -> GET /?page=1&search=...
router.get(
  "/", 
  authMiddleware, 
  ProductManagmentController.getAll
);

// --- 2. ID bilan bog'liq operatsiyalar (Parametrli URL) ---

// Bittasini olish (Get One) -> GET /:id
router.get(
  "/:id", 
  authMiddleware, 
  ProductManagmentController.getOne
);

// O'zgartirish (Update) -> PUT /:id
router.put(
  "/:id", 
  authMiddleware, 
  ProductManagmentController.update
);

// O'chirish (Delete) -> DELETE /:id
router.delete(
  "/:id", 
  authMiddleware, 
  // onlyAdminAccess, // Odatda o'chirishni faqat Admin qiladi
  ProductManagmentController.delete
);

module.exports = router;