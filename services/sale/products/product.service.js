const Product = require("../../../models/Sale/products/product.model"); // Model manzili to'g'ri ekanligiga ishonch hosil qiling
const { ExportToExcelUniversal } = require("../../../utils/excelHelper");
const moment = require('moment-timezone');

class ProductManagementService {

  
  async create(data, authorId) {
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
      };
      const newProduct = await Product.create(newProductPayload);
      return { success: true, msg: "Mahsulot muvaffaqiyatli qo'shildi!", data: newProduct };
    } catch (error) {
      console.error("Product Create Error:", error);
      return { success: false, msg: `Xatolik: ${error.message}` };
    }
  }

  
 // ... (avvalgi kod)

async update(id, updateData) {
    try {
        // 1. Yangilanishi MUMKIN BO'LMAGAN maydonlarni O'CHIRISH
        // Bu joyga kiritilgan parametrlar updateData ichida bo'lsa ham, MongoDB ga jo'natilmaydi.
        delete updateData.totalStock;
        delete updateData.margainPercent;
        delete updateData.packSalePrice;
        delete updateData.salePrice;

        // 2. Agar code o'zgarayotgan bo'lsa, u boshqa mahsulotda yo'qligini tekshirish
        if (updateData.code) {
            const duplicate = await Product.findOne({ code: updateData.code, _id: { $ne: id } });
            if (duplicate) {
                return { success: false, msg: "Bu shtrix-kod boshqa mahsulotda band!" };
            }
        }
        // 3. Mahsulotni yangilash
        // updateData endi faqat ruxsat etilgan maydonlarni o'z ichiga oladi
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

  async handleExcelExport(data) {
  try {
   const columns = [
    { header: "№", key: "index", width: 8 },
    { header: "Mahsulot nomi", key: "name", width: 35 },
    { header: "Artikul (Code)", key: "code", width: 15 },
    { header: "Kategoriya", key: "category", width: 25 },
    { header: "Tannarxi", key: "costPrice", width: 18, type: 'currency' },
    { header: "Sotuv narxi", key: "salePrice", width: 18, type: 'currency' },
    { header: "Ustama (%)", key: "margainPercent", width: 12 },
    { header: "Ombordagi qoldiq", key: "totalStock", width: 18 },
    { header: "O'lchov birligi", key: "unit", width: 15 },
    { header: "Holat", key: "status", width: 15 }
];
    const result = await ExportToExcelUniversal(data, columns, {
            title: "Mahsulot qoldig'i",
          filename: `mahsulot_Hisoboti_${moment().format("DD_MM_YYYY")}`,
            sheetName: "Mahsulotlar Ro'yxati"
        });
    
    if (!result || !result.buffer) {
      throw new Error("Excel faylini yaratishda xatolik yuz berdi (Buffer empty)");
    }

    return result; // { buffer, filename } qaytaradi
  } catch (error) {
    throw new Error(error.message);
  }
}
}

module.exports = new ProductManagementService();