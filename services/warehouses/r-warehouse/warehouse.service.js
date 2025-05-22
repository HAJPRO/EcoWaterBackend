const ReadyWarehouse = require("../../../models/warehouses/r-warehouse/r-warehouse.model");
const { generateUniquePartyNumber } = require("../../../utils/generateUniqueNumber");

class ReadyWarehouseService {
  // Modelni yaratish
  async GetModel() {
    const partyNumber = await generateUniquePartyNumber();  // Unikal partiya raqamini olish
    const model = {
      partyNumber: partyNumber, // Partiya raqami
      supplier: "", // Yetkazib beruvchi (firma yoki shaxs nomi)
      manufacturer: "", // Ishlab chiqaruvchi korxona yoki brend nomi
      senderEmployee: "", // Mahsulotni jo‘natgan xodim (ism yoki ID)
      receivedBy: "", // Mahsulotni qabul qilgan xodim
      receivedDate: new Date(), // Qabul qilingan sana (hozirgi vaqt)
      author: "", // Ushbu partiyani tizimga qo‘shgan foydalanuvchi
      notes: "", // Izohlar (ixtiyoriy maydon)
      totalAmount: "",
      blockCostPrice: "",
      costPrice: "",
      products: []
    };

    return { msg: "Model taqdim qilindi!", model };
  }

  // Yangi ReadyWarehouse yaratish
  async Create(data) {
    try {
      await ReadyWarehouse.create(data)
      return { msg: "Mahsulot muvaffaqiyatli qo'shildi!" };
    } catch (error) {
      return { msg: `Xatolik yuz berdi: ${error.message}` };
    }
  }

  // Barcha ReadyWarehouse uzunligini olish
  async getAllLength(data) {
    const all = await ReadyWarehouse.find({ author: data.author }).then((data) => {
      if (data) {
        return data.length;
      } else {
        return 0;
      }
    });
    return { all };
  }

  // Barcha ReadyWarehouse olish
  async GetAll(data) {
    try {
      const all_length = await this.getAllLength(data);
      const products = await ReadyWarehouse.find({ author: data.author }).lean();
      return { products, all_length };
    } catch (error) {
      return { msg: `Server xatosi: ${error.message}`, warehouses: [] };
    }
  }
  async GetOne(data) {
    try {
      const product = await ReadyWarehouse.findById(data.id).lean();
      return { product, msg: "Mahsulot topildi!" };
    } catch (error) {
      return { msg: `Server xatosi: ${error.message}`, warehouses: [] };
    }
  }
  async OutputProduct(data) {
    try {
      // 1. Partiyani topamiz
      const product = await ReadyWarehouse.findOne({ _id: String(data.partyId.id) });
      if (!product) {
        return { status: 404, msg: "Partiya topilmadi", warehouses: [] };
      }

      // 2. Mahsulotni topamiz
      const foundProduct = product.products.find(item => String(item._id) === String(data._id));
      console.log(foundProduct);

      if (!foundProduct) {
        return { status: 404, msg: "Mahsulot topilmadi", warehouses: [] };
      }

      // 3. Chiqarilayotgan miqdor mavjudidan oshmasligini tekshiramiz
      if (foundProduct.quantity < data.outputQuantity) {
        return { status: 400, msg: "Chiqarilayotgan miqdor mavjudidan oshib ketdi", warehouses: [] };
      }

      // 4. Miqdorni yangilash
      foundProduct.quantity -= data.outputQuantity;
      foundProduct.totalPrice = foundProduct.unit === 'Blok' ? foundProduct.quantity * foundProduct.blockCostPrice : foundProduct.quantity * foundProduct.costPrice;

      // 5. Output massivini tekshirish va chiqarilgan mahsulotni qo'shish
      if (!Array.isArray(product.output)) {
        product.output = [];
      }

      product.output.push({
        _id: foundProduct._id,
        product: foundProduct.product,
        category: foundProduct.category,
        quantity: data.outputQuantity,
        packagingType: foundProduct.packagingType,
        unit: foundProduct.unit,
        costPrice: foundProduct.costPrice,
        blockCostPrice: foundProduct.blockCostPrice,
        salePrice: foundProduct.salePrice,
        totalPrice: foundProduct.unit === 'Blok' ? data.outputQuantity * foundProduct.blockCostPrice : data.outputQuantity * foundProduct.costPrice,
        manufactureDate: foundProduct.manufactureDate,
        expireDate: foundProduct.expireDate,
        outputDate: new Date(),
      });

      // 6. Umumiy summalarni to‘g‘ri hisoblash (misol uchun)
      // totalOutputPrice – chiqarilganlar summasi
      product.totalOutputPrice = product.output.reduce((acc, item) => acc + item.totalPrice, 0);
      // totalRemainderPrice – qolgan summasi
      product.totalRemainderPrice = product.totalAmount - product.totalOutputPrice;

      // 7. Saqlash
      await product.save();

      // 8. Muvaffaqiyatli javob: qolgan mahsulotlar ro'yxati (product.products)
      return { status: 200, msg: "Chiqarish muvaffaqiyatli", warehouses: product.products };

    } catch (error) {
      return { status: 500, msg: `Server xatosi: ${error.message}`, warehouses: [] };
    }
  }


}

module.exports = new ReadyWarehouseService();
