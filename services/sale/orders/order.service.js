const mongoose = require('mongoose');
const Order = require("../../../models/Sale/orders/order.model");
const BotDriverService = require("../../../bots/drivers/services/driver.service");
const { generateUniqueOrderNumber } = require("../../../utils/generateUniqueNumber");


class OrderManagmentService {
  async Create(data) {
    const orderNumber = await generateUniqueOrderNumber(); // Unikal orderNumber olish
    try {
      const savedOrder = await Order.create({
        ...data,
        orderNumber,
      });
      return { msg: "Buyurtma muvaffaqiyatli qo'shildi!", order: savedOrder };
    } catch (error) {
      throw new Error("Buyurtma yaratishda xatolik: " + error.message);
    }
  }
  async UpdateById(data) {
    const OrderID = data.orderId;
    const DriverID = data.fullname;
    const DeliveryTime = data.deliveryTime;
    try {
      await Order.findByIdAndUpdate(OrderID, { status: "Haydovchiga yuborilmoqda", driverId: DriverID, deliveryTime: DeliveryTime, driverSentToTime: new Date() }, { new: true });
      // Endi populate qilib qayta topamiz
      const updateData = await Order.findById(OrderID)
        .populate("driverId", 'chatId') // agar boshqa bog‘langan maydonlar bo‘lsa, qo‘shing
        .populate("customerId") // misol uchun
        .populate("author", 'username fullname position'); // misol uchun
      if (updateData.status === "Haydovchiga yuborilmoqda") {
        BotDriverService.SentOrder(updateData);
      }
      return { status: 200, msg: "Haydovchiga muvaffaqiyatli yuborildi" };
    } catch (error) {
      console.error("Buyurtmani olishda xatolik: ", error);
      return { status: 500, msg: "Buyurtmani olishda xatolik: " + error.message };
    }
  }
  async OrderGetById(data) {
    const ID = data.id;

    if (!mongoose.Types.ObjectId.isValid(ID)) {
      return { status: 400, msg: "Noto'g'ri ID format." };
    }

    try {
      const order = await Order.findById(ID).populate('customerId') // customerId bilan bog'langan ma'lumotlar
        .populate('author', 'fullname position username') // authorId bilan bog'langan ma'lumotlar;

      if (!order) {
        return { status: 404, msg: "Buyurtma topilmadi." };
      }

      return { status: 200, msg: "Buyurtma malumoti yuborildi", order };
    } catch (error) {
      console.error("Buyurtmani olishda xatolik: ", error);
      return { status: 500, msg: "Buyurtmani olishda xatolik: " + error.message };
    }
  }
  async OrderGetById(data) {
    const ID = data.id;

    if (!mongoose.Types.ObjectId.isValid(ID)) {
      return { status: 400, msg: "Noto'g'ri ID format." };
    }

    try {
      const order = await Order.findById(ID).populate('customerId') // customerId bilan bog'langan ma'lumotlar
        .populate('author', 'fullname position username') // authorId bilan bog'langan ma'lumotlar;

      if (!order) {
        return { status: 404, msg: "Buyurtma topilmadi." };
      }

      return { status: 200, msg: "Buyurtma malumoti yuborildi", order };
    } catch (error) {
      console.error("Buyurtmani olishda xatolik: ", error);
      return { status: 500, msg: "Buyurtmani olishda xatolik: " + error.message };
    }
  }

  async getAllLength(data) {
    const all = await Order.find().then((data) => {
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
      if (data.status === 1) {
        const all_length = await this.getAllLength(data);
        const orders = await this.GetAllOrders(data);
        return { orders, all_length };
      } else {
        return { msg: `Server xatosi: ${error.message} `, orders: [] };
      }
    } catch (error) {
      return { msg: `Server xatosi: ${error.message} `, orders: [], all_length: {} };
    }
  }
  // 📌 **Barcha mijozlar olish**
  async GetAllOrders(data) {
    const page = Number(data.page);
    const limit = Number(data.limit)
    const skip = (page - 1) * limit;
    try {
      const orders = await Order.find()
        .skip(skip)
        .limit(limit)
        .populate("customerId") // <-- customerId ni ochadi
        .lean();

      return orders.length ? orders : [];
    } catch (error) {
      return { msg: `Server xatosi: ${error.message}` };
    }
  }


}

module.exports = new OrderManagmentService();
