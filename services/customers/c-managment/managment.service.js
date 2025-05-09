const Customer = require("../../../models/Customers/customer.model");
class CustomerManagmentService {
  async Create(data) {
    try {
      const customerExists = await Customer.exists({
        $or: [
          { passportNumber: data.passportNumber },
          { artikul: data.artikul },
        ],
      });
      console.log(customerExists);

      if (customerExists) {
        return { msg: "Bunday mijoz bazada mavjud !" };
      } else {
        const customer = new Customer(data);
        const savedCustomer = await customer.save();
        return { status: "200", msg: "Mijoz muvaffaqiyatli qo'shildi!" };
      }
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
      if(data.status === 0){
        const customers = await Customer.find().lean()
        return {customers}
      }
      if (data.status === 1) {
        const all_length = await this.getAllLength(data);
        const customers = await this.GetAllCustomers(data);
        return { customers, all_length };
      }else{
        return { msg: `Server xatosi: ${error.message} ` , customers: []};
      }
    } catch (error) {
      return { msg: `Server xatosi: ${error.message} ` , customers: [], all_length: {}};
    }
  }
  // 📌 **Barcha mijozlar olish**
async GetAllCustomers(data) {
  const page = Number(data.page) ;
  const limit = Number(data.limit)
  const skip = (page - 1) * limit;
  try {
    const customers = await Customer.find({})
      .skip(skip)
      .limit(limit)
      .lean();

    return customers.length ? customers : [];
  } catch (error) {
    return { msg: `Server xatosi: ${error.message}` };
  }
}

async DeleteById(data) {
  const id = data.id ;
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
  const id = data.id ;  
  try {
    const customer = await Customer.findById(id);
    if (!customer) {
      return { msg: "Bunday mijoz topilmadi!" };
    }else{
      
      return { msg: "Mijoz muvaffaqiyatli aniqlandi !" , customer };
    }

   
  } catch (error) {
    return { msg: `Server xatosi: ${error.message}` };
  }
 
}

}

module.exports = new CustomerManagmentService();
