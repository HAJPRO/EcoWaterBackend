const express = require("express");
const router = express.Router();
const authMiddleware = require("../../../middlewares/auth.middleware.js");
const authorMiddleware = require("../../../middlewares/author.middleware.js");
const onlyAdminAccess = require("../../../middlewares/admin.middleware.js");
const SaleposManagmentController = require("../../../controllers/sale/salepos/salepos.controller.js");
// --- 1. Sotuv Tranzaksiyasini Yaratish (Chekni Yakunlash) ---
// Frontend (Pinia) dan keladigan asosiy POST so'rovi.
router.post(
  "/create", // URL: /api/sale/salepos/
  authMiddleware, 
  SaleposManagmentController.Create
);

// --- 2. Barcha Sotuv Cheklarini Ro'yxatini olish ---
// Admin yoki Kassir uchun umumiy sotuvlar ro'yxati (Paging/Filtrlash)
router.post(
  "/all", // URL: /api/sale/salepos/list
  authMiddleware, 
  SaleposManagmentController.GetAll
);
router.post(
  "/customerId", // URL: /api/sale/salepos/list
  authMiddleware, 
  SaleposManagmentController.GetByCustomerId
);
router.post(
  "/employeeId", // URL: /api/sale/salepos/list
  authMiddleware, 
  SaleposManagmentController.GetByEmployeeId
);

// --- 3. Bitta Sotuv Chekining Detallarini olish ---
// Order ID URL parametrida berilishi kerak
router.get(
  "/:id", // URL: /api/sale/salepos/:id
  authMiddleware, 
  SaleposManagmentController.GetSaleById
);

// --- 4. Sotuv Chekini Yangilash (Status/Haydovchi biriktirish) ---
// Order ID URL parametrida berilishi kerak
router.put(
  "/:id", // URL: /api/sale/salepos/:id
  authMiddleware, 
  SaleposManagmentController.UpdateById
);

// --- 5. Haydovchilar (Agentlar) Ro'yxatini olish ---
// Mijoz/Agent tanlash uchun ma'lumotlar
router.get(
  "/drivers", // URL: /api/sale/salepos/drivers
  authMiddleware, 
  SaleposManagmentController.GetAllDrivers
);

// --- 6. Sotuv Chekini o'chirish ---
// Order ID URL parametrida berilishi kerak
router.delete(
  "/:id", // URL: /api/sale/salepos/:id
  authMiddleware, 
  SaleposManagmentController.DeleteById
);

// --- 7. Export Excel ---
// Ma'lumotlarni so'rash GET bo'lishi kerak, lekin agar katta body jo'natish kerak bo'lsa POST ham qoldirilishi mumkin.
router.post(
  "/excel", // URL: /api/sale/salepos/excel/download
  authMiddleware, 
  SaleposManagmentController.handleExcelExport
);


module.exports = router;