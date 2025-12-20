const Customer = require("../../../models/Customers/customer.model");
const Order = require("../../../models/Sale/orders/order.model");
const { ExportExcelCustomerOrders } = require("../../../utils/ExportExcel");
class CustomerManagmentService {
  async Create(data) {
    const action = data.action;
    const model = data.model;
    try {
      if (action === "create") {
        const customerExists = await Customer.exists({
          $or: [{ fullname: model.fullname }],
        });

        if (customerExists) {
          return { msg: "Bunday mijoz bazada mavjud !" };
        } else {
          const customer = new Customer(model);
          const savedCustomer = await customer.save();
          return { status: "200", msg: "Mijoz muvaffaqiyatli qo'shildi!" };
        }
      }
      if (action === "update") {
        const { _id, ...updateData } = model;
        const updated = await Customer.findByIdAndUpdate(_id, updateData, {
          new: true,
          runValidators: true,
        });

        if (!updated) {
          return { msg: "O'zgartirish uchun orderId topilmadi!" };
        }

        return { msg: "Mijoz muvaffaqiyatli o'zgartirildi!", data: updated };
      }

      return { msg: "Noto'g'ri amal turi" };
    } catch (error) {
      throw new Error("Error creating customer: " + error.message);
    }
  }

  async getAllLength(data) {
    const all = await Customer.find().then((data) => {
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
      // if (data.filter) {
      //   const all_length = await this.getAllLength(data);

      //   const customers = await Customer.find({
      //     $or: [
      //       { fullname: { $regex: data.filter.fullname, $options: "i" } },
      //       { phoneNumber: { $regex: data.filter.fullname, $options: "i" } }, // telefon raqam bo‘yicha izlash
      //     ],
      //   }).lean();

      //   if (customers.length > 0) {
      //     return { customers, all_length };
      //   } else {
      //     return {
      //       status: 404,
      //       msg: "Bunday mijoz topilmadi",
      //       all_length,
      //       customers: [],
      //     };
      //   }
      // }

      // if (data.status === 0) {
      //   const customers = await Customer.find().lean();
      //   return { customers };
      // }
      if (data) {
        const all_length = await this.getAllLength(data);
        const customers = await this.GetAllCustomers(data);
        return { customers, all_length };
      } else {
        return { msg: `Server xatosi: ${error.message} `, customers: [] };
      }
    } catch (error) {
      return {
        msg: `Server xatosi: ${error.message} `,
        customers: [],
        all_length: {},
      };
    }
  }
  // 📌 **Barcha mijozlar olish**
  async GetAllCustomers(data) {
    // const page = Number(data.page);
    // const limit = Number(data.limit);
    // const skip = (page - 1) * limit;
    try {
      const customers = await Customer.find()
console.log(data);
      return customers.length ? customers : [];
    } catch (error) {
      return { msg: `Server xatosi: ${error.message}` };
    }
  }

  async DeleteById(data) {
    const id = data.id;
    try {
      const customer = await Customer.findByIdAndDelete(id);
      if (!customer) {
        return { msg: "Bunday mijoz topilmadi!" };
      }
      return { msg: "Mijoz muvaffaqiyatli o'chirildi!" };
    } catch (error) {
      return { msg: `Server xatosi: ${error.message}` };
    }
  }
  async GetById(data) {
    const id = data.id;
    try {
      const customer = await Customer.findById(id);
      if (!customer) {
        return { msg: "Bunday mijoz topilmadi!" };
      } else {
        return { msg: "Mijoz muvaffaqiyatli aniqlandi !", customer };
      }
    } catch (error) {
      return { msg: `Server xatosi: ${error.message}` };
    }
  }
  async GetOrdersByCustomerId(data) {
    const id = data.id;
    try {
      const orders = await Order.find({ customerId: id })
        .populate("driverId") // haydovchi haqida ma'lumotni olish
        .populate("author") // author (buyurtmani kim yaratgan) haqida ma'lumot
        .populate("customerId");

      return { msg: "ok", status: 200, orders };
    } catch (error) {
      return { msg: `Server xatosi: ${error.message}` };
    }
  }
  async ExportExcelDownload(data) {
  try {
    // Utils'dagi funksiyani chaqiramiz
    const result = await ExportExcelCustomerOrders(data);
    
    if (!result || !result.buffer) {
      throw new Error("Excel faylini yaratishda xatolik yuz berdi (Buffer empty)");
    }

    return result; // { buffer, filename } qaytaradi
  } catch (error) {
    throw new Error(error.message);
  }
}
}

module.exports = new CustomerManagmentService();
