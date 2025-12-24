const ProductService = require("../../../services/sale/products/product.service.js");
const { sendExcelResponse } = require("../../../utils/excelHelper.js");

class ProductManagementController {
  
  /**
   * Yangi mahsulot yaratish (POST)
   */
  async create(req, res, next) {
    try {
      // author ID ni req.user dan, qolgan ma'lumotni req.body dan olamiz
      const result = await ProductService.create(req.body, req.user.id);
      
      // Agar service "false" qaytarsa (masalan, shtrix-kod band bo'lsa)
      if (!result.success) {
        return res.status(400).json(result);
      }

      // 201 - Created statusi
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mahsulotni yangilash (PUT/PATCH)
   * URL: /products/:id
   */
  async update(req, res, next) {
    try {
      const { id } = req.params; // ID ni URL dan olamiz
      const result = await ProductService.update(id, req.body);

      if (!result.success) {
        return res.status(404).json(result); // Topilmadi yoki xato
      }

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Barcha mahsulotlarni olish (GET)
   * URL: /products?page=1&limit=20&search=cola
   */
  async getAll(req, res, next) {
    try {
      // GET so'rovda parametrlar query dan olinadi
      const result = await ProductService.getAll(req.query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bitta mahsulotni olish (GET)
   * URL: /products/:id
   */
  async getOne(req, res, next) {
    try {
      const { id } = req.params;
      const result = await ProductService.getOne(id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mahsulotni o'chirish (DELETE)
   * URL: /products/:id
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const result = await ProductService.delete(id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async handleExcelExport(req, res) {
      try {
          // 1. Servisdan ma'lumotni olish
          // req.body - bu frontenddan kelayotgan filterlangan ma'lumotlar
          const result = await ProductService.handleExcelExport(req.body);
  
          // 2. Universal helper orqali javob qaytarish
          return sendExcelResponse(res, result);
  
      } catch (error) {
          console.error("Excel Export Error:", error.message);
          return res.status(error.status || 400).json({ 
              success: false,
              message: error.message || "Eksport jarayonida xatolik yuz berdi" 
          });
      }
  }
}

module.exports = new ProductManagementController();