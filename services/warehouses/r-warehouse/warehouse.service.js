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
      products: [],
      input: [],
      output: []
    };

    return { msg: "Model taqdim qilindi!", model };
  }

  // Yangi ReadyWarehouse yaratish
  async Create(model, action) {
    console.log(model);


    try {
      if (action === "create") {
        const changeProduct = await ReadyWarehouse.findOne({ product: model.product })
        if (changeProduct) {
          return { msg: "Bunday mahsulot sklada mavjud !", status: 404 }
        }
        await ReadyWarehouse.create({ ...model, input: model.products })
        return { status: 200, msg: "Mahsulot muvaffaqiyatli qo'shildi!" };
      }
      if (action === 'update') {
        const { id, newDataArray } = model;

        const updated = await ReadyWarehouse.findByIdAndUpdate(
          id,
          {
            $push: {
              input: newDataArray,
              products: newDataArray
            }
          },
          { new: true, runValidators: true }
        );
        return { status: 200, msg: "Muvaffaqiyatli qo'shildi" };
      } else {
        return { status: 404, msg: "Noto'g'ri amal turi" };
      }





    } catch (error) {
      return { status: 404, msg: `Xatolik yuz berdi: ${error.message}` };
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
          registeredAt: output.outputRegisteredAt,
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

  async DeleteById(data) {
    const { id, action } = data;
    console.log(data);


    const actionsMap = {
      1: { key: 'input', successMsg: "Kirim muvaffaqiyatli o'chirildi!" },
      2: { key: 'products', successMsg: "Qoldiq muvaffaqiyatli o'chirildi!" },
      3: { key: 'output', successMsg: "Chiqim muvaffaqiyatli o'chirildi!" },
      4: { key: 'main', successMsg: "Muvaffaqiyatli o'chirildi!" }
    };

    const actionInfo = actionsMap[action];

    if (!actionInfo) {
      return { status: 404, msg: "Noto‘g‘ri harakat turi!" };
    }

    try {
      if (actionInfo.key === 'main') {
        const deleted = await ReadyWarehouse.findByIdAndDelete(id);
        if (!deleted) {
          return { status: 404, msg: "Ma'lumot topilmadi." };
        }
        return { status: 200, msg: actionInfo.successMsg };
      }

      const warehouse = await ReadyWarehouse.findOne({
        [`${actionInfo.key}._id`]: id
      });

      if (!warehouse) {
        return { status: 404, msg: "Ma'lumot topilmadi." };
      }

      // Delete by filtering out matching item
      warehouse[actionInfo.key] = warehouse[actionInfo.key].filter(
        item => item._id.toString() !== id
      );

      await warehouse.save();

      return { status: 200, msg: actionInfo.successMsg };

    } catch (error) {
      return { status: 500, msg: `Server xatosi: ${error.message}` };
    }
  }







}

module.exports = new ReadyWarehouseService();
