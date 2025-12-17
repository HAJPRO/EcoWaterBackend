const ReadyWarehouse = require("../../../models/warehouses/r-warehouse/Rwarehouse.model.js");
const Product = require("../../../models/Sale/products/product.model");
const InputHistory = require("../../../models/warehouses/input/input.model");
const { generateUniquePartyNumber } = require("../../../utils/generateUniqueNumber");

class WarehouseInputService {
async create(payload) {
const newPartyNumber = await generateUniquePartyNumber();
  
  try {
    // 1. Validatsiya
    if (!payload.items || payload.items.length === 0) {
      return { success: false, status: 400, msg: "Mahsulotlar tanlanmagan!" };
    }

    const warehouseEntries = [];
    const historyItems = []; // History uchun to'g'ri formatdagi itemlar
    const now = new Date();
    let totalInvoiceAmount = 0;

    for (const item of payload.items) {
      const qty = Number(item.initialQuantity);
      const cost = Number(item.costPrice);
      const sale = Number(item.salePrice);
      
      totalInvoiceAmount += qty * cost;

      // A) Ombor (ReadyWarehouse) uchun obyekt
      warehouseEntries.push({
        product: item.product,
        supplierId: payload.supplierId,
        branchId: payload.branchId,
        initialQuantity: qty,
        currentQuantity: qty,
        costPrice: cost,
        salePrice: sale,
        partyNumber: newPartyNumber,
        status: 'active',
        createdAt: now
      });

      
      historyItems.push({
        product: item.product,
        qty: qty, // <--- Xatolik shu yerda edi, nomini mosladik
        costPrice: cost,
        salePrice: sale
      });

      // C) Product modelida umumiy qoldiqni yangilash
      await Product.findByIdAndUpdate(item.product, { 
        $inc: { totalStock: qty } 
      });
    }

    // 2. Omborga partiyalarni ommaviy yozish
    await ReadyWarehouse.insertMany(warehouseEntries);

    // 3. Kirim tarixini saqlash
    // Payload'dan emas, biz tayyorlagan 'historyItems' dan foydalanamiz
    const history = await InputHistory.create({
      partyNumber: newPartyNumber,
      supplierId: payload.supplierId,
      branchId: payload.branchId,
      items: historyItems, // <--- To'g'irlangan massiv
      totalAmount: totalInvoiceAmount,
      note: payload.note || "",
      action: payload.action || 1,
      createdAt: now
    });

    return { 
      success: true, 
      status: 201, 
      msg: `Kirim muvaffaqiyatli! Faktura: ${payload.partyNumber}`,
      data: history 
    };

  } catch (error) {
    console.log("Inbound Error:", error);

    // Duplicate key xatosi uchun chiroyli javob
    // if (error.code === 11000) {
    //   return { 
    //     success: false, 
    //     status: 400, 
    //     msg: `Xatolik: ${payload.partyNumber} raqamli faktura avval kiritilgan!` 
    //   };
    // }

    return { success: false, status: 500, msg: "Serverda xatolik yuz berdi" };
  }
}

  /**
   * Barcha partiyalarni olish (Pagination & Filter)
   */
  async getAll(query) {
    try {
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10;
      const skip = (page - 1) * limit;

      let filter = {};
      // Filterlar...
      if (query.author) filter.author = query.author;
      if (query.search) {
        filter.$or = [
            { partyNumber: { $regex: query.search, $options: "i" } },
            // Product modelidan qidirish uchun $lookup (populate) kerak bo'ladi.
        ];
      }
      if (query.status) filter.status = query.status;


      const [products, total] = await Promise.all([
        ReadyWarehouse.find(filter)
          .populate('product', 'name code image unit') // Product modelidan kerakli maydonlarni olamiz
          .populate('supplier', 'company')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        ReadyWarehouse.countDocuments(filter)
      ]);

      return { 
        success: true, 
        products, 
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
      };

    } catch (error) {
      return { success: false, msg: `Server xatosi: ${error.message}`, products: [] };
    }
  }
  
  /**
   * Bitta partiyani olish
   */
  async getOne(id) {
    try {
      const product = await ReadyWarehouse.findById(id).populate('product').lean();
      if (!product) {
          return { success: false, status: 404, msg: "Partiya topilmadi" };
      }
      return { success: true, product };
    } catch (error) {
      return { success: false, status: 500, msg: `Server xatosi: ${error.message}` };
    }
  }

  /**
   * Mahsulot chiqarish (Sotuv/Chiqim) - Frontending OutputProduct() bilan ishlashi kerak
   * @param {Object} data - { partyId: {id}, output: [{_id, outputQuantity, ...}] }
   */
  async outputProduct(data) {
    const partyId = data.partyId.id; // Partiya IDsi
    const outputItem = Array.isArray(data.output) ? data.output[0] : data.output; // Frontend odatda bitta item yuboradi

    if (!outputItem || !outputItem.outputQuantity || outputItem.outputQuantity <= 0) {
        return { success: false, status: 400, msg: "Noto'g'ri chiqim miqdori" };
    }

    try {
      // 1. Partiyani topamiz va miqdorni tekshiramiz
      const party = await ReadyWarehouse.findById(partyId);
      if (!party) {
        return { success: false, status: 404, msg: "Partiya topilmadi" };
      }

      // 2. Qoldiq tekshiruvi
      if (party.currentQuantity < outputItem.outputQuantity) {
        return { success: false, status: 400, msg: `Chiqarilayotgan miqdor mavjudidan (${party.currentQuantity}) oshib ketdi` };
      }
      
      const quantityToSubtract = outputItem.outputQuantity;
      
      // 3. Partiyadagi qoldiqni kamaytiramiz
      party.currentQuantity -= quantityToSubtract;
      if (party.currentQuantity === 0) {
          party.status = 'sold_out';
      }

      // 4. Global Product qoldig'ini kamaytiramiz
      await Product.findByIdAndUpdate(
          party.product,
          { $inc: { totalStock: -quantityToSubtract } } // Minus bilan kamaytiramiz
      );

      // 5. Saqlash
      await party.save();

      return { success: true, status: 200, msg: "Mahsulot muvaffaqiyatli chiqarildi", data: party };

    } catch (error) {
      console.error("Output Product Error:", error);
      return { success: false, status: 500, msg: `Server xatosi: ${error.message}` };
    }
  }
  
  /**
   * O'chirish (DELETE) - Hujjatni yoki ichki elementni o'chirish
   * Frontend: ReadyWarehouseService.DeleteById(id, action);
   */
  async deleteById(id, action = 4) {
    const actionsMap = {
        // Hozirgi modelda input/output massivi yo'q, faqat asosiy hujjat bor, shuning uchun action 1, 2, 3 mantiqsiz.
        // Agar bo'lsa, $pull ishlatilardi.
        4: { msg: "Partiya butunlay o'chirildi", key: 'main' }
    };
    
    if (action !== 4) {
        return { success: false, status: 400, msg: "Faqat to'liq partiyani o'chirishga ruxsat bor!" };
    }

    try {
      const deletedParty = await ReadyWarehouse.findByIdAndDelete(id);
      
      if (!deletedParty) {
        return { success: false, status: 404, msg: "Ma'lumot topilmadi." };
      }
      
      // ⚠️ PARTIYA O'CHIRILGANDA: Product totalStock ni qayta hisoblash
      await Product.findByIdAndUpdate(
          deletedParty.product,
          { $inc: { totalStock: -deletedParty.currentQuantity } } // O'chirilgan qoldiqni ayiramiz
      );

      return { success: true, status: 200, msg: actionsMap[action].msg };

    } catch (error) {
      return { success: false, status: 500, msg: `Server xatosi: ${error.message}` };
    }
  }
}

module.exports = new WarehouseInputService();