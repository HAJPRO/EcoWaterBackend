const mongoose = require("mongoose");
const Order = require("../../../models/Sale/orders/order.model");
const UserModel = require("../../../models/user.model");

const BotDriverService = require("../../../bots/drivers/services/driver.service");
const {
  generateUniqueOrderNumber,
} = require("../../../utils/generateUniqueNumber");

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
      await Order.findByIdAndUpdate(
        OrderID,
        {
          status: "Haydovchiga yuborilmoqda",
          driverId: DriverID,
          deliveryTime: DeliveryTime,
          driverSentToTime: new Date(),
        },
        { new: true }
      );
      // Endi populate qilib qayta topamiz
      const updateData = await Order.findById(OrderID)
        .populate("driverId", "chatId") // agar boshqa bog‘langan maydonlar bo‘lsa, qo‘shing
        .populate("customerId") // misol uchun
        .populate("author", "username fullname position"); // misol uchun
      await BotDriverService.SentOrder(updateData);
      return { status: 200, msg: "Haydovchiga muvaffaqiyatli yuborildi" };
    } catch (error) {
      console.error("Buyurtmani olishda xatolik: ", error);
      return {
        status: 500,
        msg: "Buyurtmani olishda xatolik: " + error.message,
      };
    }
  }
  async OrderGetById(data) {
    const ID = data.id;

    if (!mongoose.Types.ObjectId.isValid(ID)) {
      return { status: 400, msg: "Noto'g'ri ID format." };
    }

    try {
      const order = await Order.findById(ID)
        .populate("customerId") // customerId bilan bog'langan ma'lumotlar
        .populate("author", "fullname position username"); // authorId bilan bog'langan ma'lumotlar;

      if (!order) {
        return { status: 404, msg: "Buyurtma topilmadi." };
      }

      return { status: 200, msg: "Buyurtma malumoti yuborildi", order };
    } catch (error) {
      console.error("Buyurtmani olishda xatolik: ", error);
      return {
        status: 500,
        msg: "Buyurtmani olishda xatolik: " + error.message,
      };
    }
  }
  async OrderGetById(data) {
    const ID = data.id;

    if (!mongoose.Types.ObjectId.isValid(ID)) {
      return { status: 400, msg: "Noto'g'ri ID format." };
    }

    try {
      const order = await Order.findById(ID)
        .populate("customerId") // customerId bilan bog'langan ma'lumotlar
        .populate("author", "fullname position username"); // authorId bilan bog'langan ma'lumotlar;

      if (!order) {
        return { status: 404, msg: "Buyurtma topilmadi." };
      }

      return { status: 200, msg: "Buyurtma malumoti yuborildi", order };
    } catch (error) {
      console.error("Buyurtmani olishda xatolik: ", error);
      return {
        status: 500,
        msg: "Buyurtmani olishda xatolik: " + error.message,
      };
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
      if (data.filter) {
        // Agar fullname bo‘sh bo‘lsa, to‘g‘ridan-to‘g‘ri barcha orderlarni qaytaramiz
        if (data.filter.fullname === "") {
          const orders = await this.GetAllOrders({
            status: 1,
            page: 1,
            limit: 10,
          });
          const all_length = await this.getAllLength(data);
          return { orders, all_length };
        }

        // fullname mavjud bo‘lsa, qidiruv amalga oshiriladi
        const orders = await Order.aggregate([
          {
            $lookup: {
              from: "customers",
              localField: "customerId",
              foreignField: "_id",
              as: "customerId",
            },
          },
          { $unwind: "$customerId" },
          {
            $match: {
              $or: [
                {
                  "customerId.fullname": {
                    $regex: `^${data.filter.fullname}`,
                    $options: "i",
                  },
                },
                { "customerId.fullname": data.filter.fullname },
                {
                  "customerId.phoneNumber": {
                    $regex: data.filter.fullname,
                    $options: "i",
                  },
                },
                {
                  orderNumber: {
                    $regex: data.filter.fullname,
                    $options: "i",
                  },
                },
              ],
            },
          },
        ]);

        const all_length = await this.getAllLength(data);

        if (orders.length > 0) {
          return { orders, all_length };
        } else {
          return {
            status: 404,
            msg: "Bunday mijoz topilmadi",
            orders: [],
            all_length,
          };
        }
      }

      if (data.status === 1) {
        const all_length = await this.getAllLength(data);
        const orders = await this.GetAllOrders(data);
        return { orders, all_length };
      } else {
        return { msg: `Server xatosi: ${error.message} `, orders: [] };
      }
    } catch (error) {
      return {
        msg: `Server xatosi: ${error.message} `,
        orders: [],
        all_length: {},
      };
    }
  }
  // 📌 **Barcha mijozlar olish**
  async GetAllOrders(data) {
    const page = Number(data.page);
    const limit = Number(data.limit);
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

  // 📌 **Barcha haydovchilar olish**
  async GetAllDrivers(data) {
    try {
      // Barcha foydalanuvchilarni roles bilan birga olish
      const users = await UserModel.find().populate("roles").lean();

      // roles ichida name = 'driver' yoki 'haydovchi' bo‘lganlarni filter qilish
      const drivers = users.filter((user) =>
        user.roles?.some(
          (role) =>
            role.name?.toLowerCase() === "driver" ||
            role.name?.toLowerCase() === "haydovchi"
        )
      );

      return { drivers };
    } catch (error) {
      console.error("GetAllDrivers xatolik:", error);
      return { msg: `Server xatosi: ${error.message}` };
    }
  }
  async ExportExcelDownload(data) {
    try {
      console.log(data);
    } catch (error) {
      return { msg: `Server xatosi: ${error.message}` };
    }
  }

  async DeleteById(data) {
    try {
      const { id, author } = data;
      const order = await Order.findOne({ _id: id, author: author });
      if (order) {
        await Order.findByIdAndDelete({ _id: id });
        return { msg: "Muvaffaqiyatli o'chirildi !", status: 200 };
      } else {
        return {
          msg: "Bu buyurtmani o'chirishga sizda huquq yuq !",
          status: 500,
        };
      }
    } catch (error) {
      return { msg: `Server xatosi: ${error.message}` };
    }
  }
}

module.exports = new OrderManagmentService();
