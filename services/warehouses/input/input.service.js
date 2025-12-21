const ReadyWarehouse = require("../../../models/warehouses/r-warehouse/Rwarehouse.model.js");
const Product = require("../../../models/Sale/products/product.model");
const InputHistory = require("../../../models/warehouses/input/input.model");
const SaleModel = require("../../../models/Sale/orders/sales.model.js");
const { generateUniquePartyNumber } = require("../../../utils/generateUniqueNumber");

class WarehouseInputService {
async create(payload) {
  const newPartyNumber =`FKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
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
        partyNumber: payload.partyNumber,
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
      partyNumber: payload.partyNumber,
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
 
 async getAll(payload) {
  console.log(payload)
  // 1. Argument nomini payload-ga o'zgartirdik (data bilan adashmaslik uchun)
  const { status,author,startDate,endDate,search } = payload;
  
  try {
    // 2. Pagination parametrlarini standartlashtirish
    const page = Math.max(1, parseInt(payload.page) || 1);
    const limit = Math.max(1, parseInt(payload.limit) || 10);
    const skip = (page - 1) * limit;

    // 3. Dinamik filtr obyektini shakllantirish
    let filter = {};

    if (author) filter.author = author;
    if (status) filter.status = status;

    // Sana oralig'i (Frontenddan kelsa)
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Kun oxirigacha qamrab olish
        filter.createdAt.$lte = end;
      }
    }

    // Qidiruv mantiqi
    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      filter.$or = [
        { partyNumber: searchRegex },
        { manufacturer: searchRegex }
      ];
    }

    // 4. So'rovni bajarish (Parallel ravishda)
    // Natijani 'items' deb nomladik, 'data' emas
    const [items, total] = await Promise.all([
      InputHistory.find()
        // .populate('product', 'name code category unit') 
        // .populate('author', 'fullname role') 
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(), 
      InputHistory.countDocuments(filter)
    ]);

    // 5. Natijani qaytarish
    return { 
      success: true, 
      data: items, // Frontend uchun standart 'data' kaliti ostida yuboramiz
      pagination: { 
        total, 
        page, 
        limit, 
        totalPages: Math.ceil(total / limit) 
      }
    };

  } catch (error) {
    console.error("Database Error:", error);
    return { 
      success: false, 
      msg: `Server xatosi: ${error.message}`, 
      data: [],
      pagination: { total: 0, page: 1, limit: 10, totalPages: 0 }
    };
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

async clearAllData() {
  try {
    // Barcha partiyalarni va kirim tarixini o'chirish
    await ReadyWarehouse.deleteMany({});
    await InputHistory.deleteMany({});
    await SaleModel.deleteMany({});
    await Product.updateMany({}, { totalStock: 0 });
    return { success: true, msg: "Barcha ma'lumotlar o'chirildi!" };
  } catch (error) {
    return { error: true, msg: error.msg};
  }
}
}

module.exports = new WarehouseInputService();