const Driver = require("../../../bots/model/drivers/driver.model");
const UserModel = require("../../../models/user.model");

class CustomerManagmentService {


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
      if (data.status === 0) {
        const drivers = await UserModel.find({ role: 'driver' }).lean()
        return { drivers }
      }
      else {
        return { msg: `Server xatosi: ${error.message} `, customers: [] };
      }
    } catch (error) {
      return { msg: `Server xatosi: ${error.message} `, drivers: [] };
    }
  }
  // 📌 **Barcha mijozlar olish**
  // async GetAllCustomers(data) {
  //   const page = Number(data.page) ;
  //   const limit = Number(data.limit)
  //   const skip = (page - 1) * limit;
  //   try {
  //     const customers = await Customer.find({})
  //       .skip(skip)
  //       .limit(limit)
  //       .lean();

  //     return customers.length ? customers : [];
  //   } catch (error) {
  //     return { msg: `Server xatosi: ${error.message}` };
  //   }
  // }

  // async DeleteById(data) {
  //   const id = data.id ;
  //   try {
  //     const customer = await Customer.findByIdAndDelete(id);
  //     if (!customer) {
  //       return { msg: "Bunday mijoz topilmadi!" };
  //     }
  //     return { msg: "Mijoz muvaffaqiyatli o'chirildi!" };
  //   } catch (error) {
  //     return { msg: `Server xatosi: ${error.message}` };
  //   }

  // }
  // async GetById(data) {
  //   const id = data.id ;  
  //   try {
  //     const customer = await Customer.findById(id);
  //     if (!customer) {
  //       return { msg: "Bunday mijoz topilmadi!" };
  //     }else{

  //       return { msg: "Mijoz muvaffaqiyatli aniqlandi !" , customer };
  //     }


  //   } catch (error) {
  //     return { msg: `Server xatosi: ${error.message}` };
  //   }

  // }

}

module.exports = new CustomerManagmentService();
