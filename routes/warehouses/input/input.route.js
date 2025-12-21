const express = require("express");
const router = express.Router();

// Middlewarelar
const authMiddleware = require("../../../middlewares/auth.middleware.js");
const authorMiddleware = require("../../../middlewares/author.middleware.js"); // Odatda foydalaniladi
const onlyAdminAccess = require("../../../middlewares/admin.middleware.js"); // Odatda foydalaniladi

// Controller
const WarehouseInputController = require("../../../controllers/warehouses/input/input.controller.js");

// Asosiy path prefixi: /input

// --- 1. GET (Ma'lumot olish) ---

// Mahsulot partiyasi model shablonini olish
// GET /api/warehouses/input/model
router.get(
  "/model",
  authMiddleware,
  WarehouseInputController.getModel // Naming convention: getModel
);

// Barcha partiyalarni olish (Pagination va Search bilan)
// GET /api/warehouses/input/?page=1&limit=10&search=...
router.post(
  "/all",
  authMiddleware,
  WarehouseInputController.getAll // Controllerdagi getAll metodi
);

// Bitta partiyani ID orqali olish
// GET /api/warehouses/input/:id
router.get(
  "/:id",
  authMiddleware,
  WarehouseInputController.getOne // Controllerdagi getOne metodi
);


// --- 2. POST (Yaratish va Murakkab Tranzaksiya) ---

// Yangi kirim partiyasini yaratish (Frontend har bir item uchun chaqiradi)
// POST /api/warehouses/input/
router.post(
  "/create",
  authMiddleware,
  WarehouseInputController.create // Controllerdagi create metodi
);

// Partiyadan mahsulot chiqarish (Sotuv/Chiqim) - Tranzaksiya
// POST /api/warehouses/input/output
router.post(
  "/output",
  authMiddleware,
  WarehouseInputController.outputProduct
);


// --- 3. DELETE (O'chirish) ---

// Partiyani butunlay o'chirish
// DELETE /api/warehouses/input/:id?action=4
router.delete(
  "/input/:id",
  authMiddleware,
  // onlyAdminAccess, // Agar o'chirish faqat Adminda bo'lsa
  WarehouseInputController.deleteById
);

// --- 4. TOZALASH (FAKULTATIV) ---
// Barcha ombor va savdo ma'lumotlarini tozalash (FAKULTATIV, ehtiyotkorlik bilan ishlating!)
// POST /api/warehouses/input/clear-all 
router.post(
  "/clear-all",
  authMiddleware,
  // onlyAdminAccess, // Faqat Adminlar ruxsat etiladi
  WarehouseInputController.clearAllData
);

module.exports = router;