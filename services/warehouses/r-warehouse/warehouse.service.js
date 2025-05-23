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
  async Create(model, action) {

    try {
      if (action === "create") {
        await ReadyWarehouse.create(model)
        return { msg: "Mahsulot muvaffaqiyatli qo'shildi!" };
      }
      if (action === 'update') {
        const { _id, ...updateData } = model
        const updated = await ReadyWarehouse.findByIdAndUpdate(
          _id,
          updateData,
          { new: true, runValidators: true }
        );

        if (!updated) {
          return { msg: "O'zgartirish uchun orderId topilmadi!" };
        }

        return { msg: "Mahsulot muvaffaqiyatli o'zgartirildi!", data: updated };
      }

      return { msg: "Noto'g'ri amal turi" };


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
    console.log(data);

    try {
      const all_length = await this.getAllLength(data);
      const products = await this.GetAllParty(data)

      return { products, all_length };
    } catch (error) {
      return { msg: `Server xatosi: ${error.message}`, warehouses: [] };
    }
  }
  // 📌 **Barcha partyalar**
  async GetAllParty(data) {
    const page = Number(data.page);
    const limit = Number(data.limit)
    const skip = (page - 1) * limit;
    try {
      const products = await ReadyWarehouse.find({ author: data.author })
        .skip(skip)
        .limit(limit)
        .lean();

      return products.length ? products : [];
    } catch (error) {
      return { msg: `Server xatosi: ${error.message}` };
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
    const partyId = data.partyId.id;
    const output = data.output;

    try {
      // Output - array bo'lsa ham, object bo'lsa ham, uni massiv sifatida ishlaymiz
      const outputItems = Array.isArray(output) ? output : [output];

      // 1. Partiyani topamiz
      const product = await ReadyWarehouse.findOne({ _id: String(partyId) });
      if (!product) {
        return { status: 404, msg: "Partiya topilmadi", warehouses: [] };
      }

      // 2. Har bir chiqarilayotgan mahsulotni ko‘rib chiqamiz
      for (const outputItem of outputItems) {
        const foundProduct = product.products.find(item => String(item._id) === String(outputItem._id));
        if (!foundProduct) {
          return { status: 404, msg: `Mahsulot topilmadi (ID: ${outputItem._id})`, warehouses: [] };
        }

        if (foundProduct.quantity < outputItem.outputQuantity) {
          return { status: 400, msg: `Chiqarilayotgan miqdor mavjudidan oshib ketdi (ID: ${outputItem._id})`, warehouses: [] };
        }

        // Miqdorni kamaytirish
        foundProduct.quantity -= outputItem.outputQuantity;
        foundProduct.totalPrice = foundProduct.unit === 'Blok'
          ? foundProduct.quantity * foundProduct.blockCostPrice
          : foundProduct.quantity * foundProduct.costPrice;

        // Output massivga qo'shish
        if (!Array.isArray(product.output)) {
          product.output = [];
        }

        product.output.push({
          _id: foundProduct._id,
          product: foundProduct.product,
          category: foundProduct.category,
          quantity: outputItem.outputQuantity,
          packagingType: foundProduct.packagingType,
          unit: foundProduct.unit,
          costPrice: foundProduct.costPrice,
          blockCostPrice: foundProduct.blockCostPrice,
          salePrice: foundProduct.salePrice,
          totalPrice: foundProduct.unit === 'Blok'
            ? outputItem.outputQuantity * foundProduct.blockCostPrice
            : outputItem.outputQuantity * foundProduct.costPrice,
          manufactureDate: foundProduct.manufactureDate,
          expireDate: foundProduct.expireDate,
          outputDate: new Date(),
          outputResponsible: foundProduct.outputResponsible || outputItem.outputResponsible,
          outputRecipient: foundProduct.outputRecipient || outputItem.outputRecipient,
        });
      }

      // 3. Umumiy summalarni hisoblash
      product.totalOutputPrice = product.output.reduce((acc, item) => acc + item.totalPrice, 0);
      product.totalRemainderPrice = product.totalAmount - product.totalOutputPrice;

      // 4. Saqlash
      await product.save();

      // 5. Javob
      return { status: 200, msg: "Chiqarish muvaffaqiyatli", warehouses: product.products };

    } catch (error) {
      return { status: 500, msg: `Server xatosi: ${error.message}`, warehouses: [] };
    }
  }




}

module.exports = new ReadyWarehouseService();
