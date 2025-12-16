const ReadyWarehouse = require("../../../models/warehouses/r-warehouse/r-warehouse.model");
const Product = require("../../../models/Sale/products/product.model"); // Product modelini yangilash uchun
const { generateUniquePartyNumber } = require("../../../utils/generateUniqueNumber");

class WarehouseInputService {

  /**
   * Bitta partiyani yaratish (Frontenddan kirim qilingan har bir mahsulot qatori uchun chaqiriladi)
   * @param {Object} payload - ReadyWarehouse schema'siga mos ma'lumotlar
   * @param {string} action - 'create' yoki 'update'
   */
  async create(payload, action = 'create') {
    console.log("Payload received in service:", payload, "Action:", action);
    
    try {
      // 1. Validatsiya: Boshlang'ich miqdor mavjudligini tekshirish
      if (!payload.initialQuantity || payload.initialQuantity <= 0) {
        return { success: false, status: 400, msg: "Kirim miqdori noto'g'ri (0 dan katta bo'lishi kerak)" };
      }

      // 2. YARATISH (Yangi Partiya)
      if (action === "create") {
        
        // Mahsulot mavjudligini tekshirish (Opsional, ammo yaxshi)
        const productExists = await Product.findById(payload.product);
        if (!productExists) {
             return { success: false, status: 404, msg: "Mahsulot katalogda topilmadi!" };
        }
        
        // Agar partyNumber berilmasa, avtomatik generatsiya qilish (Frontend o'zida yuboryapti, lekin backend nazorat qiladi)
        if (!payload.partyNumber) {
            payload.partyNumber = await generateUniquePartyNumber();
        }

        const newParty = await ReadyWarehouse.create({
          ...payload,
          // Boshlang'ich va joriy qoldiqni o'rnatish
          currentQuantity: payload.initialQuantity, 
        });
        
        // 3. PRODUCT MODEL'dagi TOTALSTOCK ni yangilash
        // Bu tranzaksiyaning eng muhim qismi!
        await Product.findByIdAndUpdate(
            payload.product,
            { $inc: { totalStock: payload.initialQuantity } },
            { new: true }
        );

        return { success: true, status: 201, msg: "Kirim partiyasi muvaffaqiyatli saqlandi!", data: newParty };
      }

      // 4. YANGILASH (Qo'shimcha kirim)
      if (action === 'update') {
          // Bu logika kirim qilish uchun kam ishlatiladi. Odatda yangi partiya ochiladi.
          // Agar kerak bo'lsa, mavjud partiyaning `currentQuantity` va `initialQuantity` lari $inc bilan oshiriladi.
          return { success: false, status: 405, msg: "Partiya yangilanishi notog'ri. Iltimos, yangi partiya yarating." };
      }
      
      return { success: false, status: 400, msg: "Noto'g'ri amal turi" };

    } catch (error) {
      console.error("ReadyWarehouse Create Error:", error);
      return { success: false, status: 500, msg: `Server xatosi: ${error.message}` };
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