const mongoose = require('mongoose');
const Product = require("../../../models/Sale/products/product.model");

class ProductManagmentService {
  // Mahsulot qo'shish
  async Create(data) {
    const { action, model, author } = data
    try {


      if (action === 'create') {
        const existingProduct = await Product.findOne({ code: model.code, pro_name: model.pro_name });
        if (existingProduct) {
          return { msg: "Bunday mahsulot mavjud !" }; // Agar mahsulot mavjud bo'lsa
        }
        const product = await Product.create(data);
        return { msg: "Mahsulot muvaffaqiyatli qo'shildi !" }; // Yangi mahsulot yaratildi
      }
      if (action === 'update') {
        const { _id, ...updateData } = model
        const update = await Product.findByIdAndUpdate(_id, updateData, { new: true, runValidators: true })
        return { msg: "Mahsulot muvaffaqiyatli o'zgartirildi !" }; // Yangi mahsulot yaratildi
      }
      return { msg: "Noto'g'ri harakat !" };
    } catch (error) {
      // Xatolikni qaytarish
      console.error("Mahsulotni yaratishda xatolik:", error);
      throw new Error("Mahsulotni yaratishda xatolik yuz berdi");
    }
  }

  async getAllLength(data) {
    const all = await Product.find().then((data) => {
      if (data) {
        return data.length;
      } else {
        return 0;
      }
    });
    return { all };
  }
  async GetAll(data) {

    try {
      if (data.status === 0) {
        const products = await Product.find().lean()
        return { products }
      }
      if (data.status === 1) {
        const all_length = await this.getAllLength(data);
        const products = await this.GetAllProducts(data);
        return { products, all_length };
      } else {
        return { msg: `Server xatosi: ${error.message} `, products: [] };
      }
    } catch (error) {
      return { msg: `Server xatosi: ${error.message} `, products: [], all_length: {} };
    }
  }
  // 📌 **Barcha mijozlar olish**
  async GetAllProducts(data) {
    const page = Number(data.page);
    const limit = Number(data.limit)
    const skip = (page - 1) * limit;
    try {
      const products = await Product.find({})
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
      const product = await Product.findById(data.id).lean();
      return { msg: "Mahsilotv topildi", product }
    } catch (error) {
      return { msg: `Server xatosi: ${error.message}` };
    }
  };
  async DeleteById(data) {
    try {
      const deleted = await Product.findByIdAndDelete(data.id);
      if (!deleted) {
        return { msg: "Mahsulot topilmadi yoki allaqachon o'chirilgan" };
      }
      return { msg: "Mahsulot o'chirildi", success: true };
    } catch (error) {
      return { msg: `Server xatosi: ${error.message}` };
    }
  }

}

module.exports = new ProductManagmentService();
