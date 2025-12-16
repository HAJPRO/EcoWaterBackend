const Product = require("../../../models/Sale/products/product.model"); // Model manzili to'g'ri ekanligiga ishonch hosil qiling

class ProductManagementService {

  /**
   * Yangi mahsulot yaratish
   * @param {Object} data - Mahsulot ma'lumotlari
   * @param {String} authorId - Yaratuvchi ID
   */
  async create(data, authorId) {
    console.log(data, authorId);
    try {
      // 1. Shtrix-kod (code) takrorlanmasligini tekshirish
      const existingProduct = await Product.findOne({ code: data.code });
      if (existingProduct) {
        return { success: false, msg: `Diqqat: ${data.code} kodli mahsulot allaqachon mavjud!` };
      }

      // 2. Yangi obyektni tayyorlash (Yangi Schema bo'yicha)
      const newProductPayload = {
        ...data,
        author: authorId,
        // Frontenddan kelayotgan ma'lumotlarni yangi modelga moslash
        // Agar front hali eski nomlarni ishlatsa, shu yerda mapping qilinadi:
        name: data.name || data.pro_name, 
        salePrice: data.salePrice || data.buying_price, 
      };

      const newProduct = await Product.create(newProductPayload);
      
      return { success: true, msg: "Mahsulot muvaffaqiyatli qo'shildi!", data: newProduct };
    } catch (error) {
      console.error("Product Create Error:", error);
      return { success: false, msg: `Xatolik: ${error.message}` };
    }
  }

  /**
   * Mahsulotni tahrirlash
   * @param {String} id - Mahsulot ID
   * @param {Object} updateData - O'zgaradigan ma'lumotlar
   */
  async update(id, updateData) {
    try {
      // Agar code o'zgarayotgan bo'lsa, u boshqa mahsulotda yo'qligini tekshirish kerak
      if (updateData.code) {
        const duplicate = await Product.findOne({ code: updateData.code, _id: { $ne: id } });
        if (duplicate) {
          return { success: false, msg: "Bu shtrix-kod boshqa mahsulotda band!" };
        }
      }

      const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { 
        new: true, 
        runValidators: true 
      });

      if (!updatedProduct) {
        return { success: false, msg: "Mahsulot topilmadi" };
      }

      return { success: true, msg: "Mahsulot muvaffaqiyatli yangilandi!", data: updatedProduct };
    } catch (error) {
      return { success: false, msg: `Xatolik: ${error.message}` };
    }
  }

  /**
   * Barcha mahsulotlarni olish (Pagination + Search + Filter)
   * @param {Object} query - { page, limit, search, category }
   */
  async getAll(query) {
    try {
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 20;
      const skip = (page - 1) * limit;
      
      // Qidiruv shartlarini yig'ish
      let filter = { status: "active" }; // Default faqat aktivlar

      // Qidiruv (Nom yoki Kod bo'yicha)
      if (query.search) {
        filter.$or = [
          { name: { $regex: query.search, $options: "i" } },
          { code: { $regex: query.search, $options: "i" } }
        ];
      }

      // Kategoriya bo'yicha
      if (query.category && query.category !== "Barchasi") {
        filter.category = query.category;
      }

      // So'rovlarni parallel bajarish (tezlik uchun)
      const [products, total] = await Promise.all([
        Product.find(filter)
          .sort({ createdAt: -1 }) // Eng yangilari tepada
          .skip(skip)
          .limit(limit)
          .lean(), // Faqat JSON qaytaradi (tez)
        Product.countDocuments(filter)
      ]);

      return {
        success: true,
        products,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      return { success: false, msg: `Server xatosi: ${error.message}`, products: [] };
    }
  }

  /**
   * Bitta mahsulotni ID bo'yicha olish
   */
  async getOne(id) {
    try {
      const product = await Product.findById(id).lean();
      if (!product) {
        return { success: false, msg: "Mahsulot topilmadi" };
      }
      return { success: true, data: product };
    } catch (error) {
      return { success: false, msg: `Xatolik: ${error.message}` };
    }
  }

  /**
   * Mahsulotni o'chirish (yoki arxivlash)
   */
  async delete(id) {
    try {
      // 1-variant: Butunlay o'chirish (Physical Delete)
      const deleted = await Product.findByIdAndDelete(id);
      
      // 2-variant: Arxivlash (Tavsiya etiladi, agar sotuv tarixi bo'lsa)
      // const deleted = await Product.findByIdAndUpdate(id, { status: 'archived' });

      if (!deleted) {
        return { success: false, msg: "Mahsulot topilmadi" };
      }
      return { success: true, msg: "Mahsulot o'chirildi" };
    } catch (error) {
      return { success: false, msg: `Xatolik: ${error.message}` };
    }
  }
}

module.exports = new ProductManagementService();