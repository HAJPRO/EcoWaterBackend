const mongoose = require("mongoose");
const InputWeavingPlanModel = require("../../models/Weaving/InputWeavingPlan.model");
const InputSpinningPlanModel = require("../../models/Spinning/InputSpinningPlan.model");
const provideModel = require("../../models/Provide/provide.model");
const SaleCardModel = require("../../models/Sale/SaleCard.model");

// const fileService = require("./file.service");

class DepSpinningService {
  async getModel() {
    const model = {
      begunok_name: "",
      begunok_type: "",
      begunok_quantity: "",
      latun_name: "",
      latun_type: "",
      latun_quantity: "",
      delivery_time_provide: "",
    };
    return model;
  }

  async getAllLength(data) {
    const user_id = new mongoose.Types.ObjectId(data.user.id);
    const department = data.user.department;
    const process_length = await this.getAllInProcess(user_id).then((data) => {
      if (data) {
        return data.length;
      } else {
        return 0;
      }
    });
    const weaving_length = await this.AllSentFromWeaving(user_id).then(
      (data) => {
        if (data) {
          return data.length;
        } else {
          return 0;
        }
      }
    );
    const provide_length = await this.AllSentToProvide({
      id: user_id,
      department,
    }).then((data) => {
      if (data) {
        return data.length;
      } else {
        return 0;
      }
    });

    return { process_length, weaving_length, provide_length };
  }
  async getAll(data) {
    const is_status = data.status.status;
    const user_id = new mongoose.Types.ObjectId(data.user.id);
    const department = data.user.department;

    try {
      if (is_status === 1) {
        const all_length = await this.getAllLength(data);
        const items = await this.getAllInProcess(user_id);
        return { items, all_length };
      }
      if (is_status === 2) {
        const all_length = await this.getAllLength(data);
        const items = await this.AllSentFromWeaving(user_id);
        return { items, all_length };
      }

      if (is_status === 3) {
        const all_length = await this.getAllLength(data);
        const items = await this.AllSentToProvide({ id: user_id, department });
        return { items, all_length };
      }
    } catch (error) {
      return error.message;
    }
  }
  async getAllInProcess(id) {
    try {
    } catch (error) {
      return error.message;
    }
  }

  async AllSentFromWeaving(id) {
    try {
      const data = await InputWeavingPlanModel.find({
        status: "Jarayonda",
        author: id,
      });
      return data;
    } catch (error) {
      return error.message;
    }
  }

  async AllSentToProvide(data) {
    try {
    } catch (error) {
      return error.message;
    }
  }
  async AcceptAndCreate(payload) {
    try {
      this.CreateInputSpinningPlan(payload);
      // this.CreateProvide(payload);
      return { status: 200, msg: "Muvaffaqiyatli qabul qilindi!" };
    } catch (error) {
      return error.message;
    }
  }
  async CreateInputSpinningPlan(payload) {
    const saleCard = await SaleCardModel.findOne({
      order_number: payload.data.items.order_number,
    });
    const NewData = saleCard;
    const proccess_status = {
      department: payload.user.department,
      author: payload.user.username,
      is_confirm: { status: true, reason: "" },
      status: "Yijiruvda jarayonda",
      sent_time: new Date(),
    };
    NewData.process_status.push(proccess_status);
    NewData.status = "Yigiruvda jarayonda";
    await SaleCardModel.findByIdAndUpdate(saleCard._id, NewData, {
      new: true,
    });

    const info = {
      author: payload.user.id,
      customer_name: payload.data.items.customer_name,
      order_number: payload.data.items.order_number,
      artikul: payload.data.items.artikul,
      weaving_quantity: payload.data.items.spinning_quantity, // total spinning
      weaving_products: payload.data.items.spinning_products, // spinning_products
      delivery_time_weaving: payload.data.items.delivery_time_spinning,
    };

    const res = await InputSpinningPlanModel.create(info);
  }
  async CreateProvide(payload) {
    const newData = {
      author: payload.user.id,
      department: payload.user.department,
      delivery_product_box: {
        begunok_name: payload.data.provide.begunok_name,
        begunok_type: payload.data.provide.begunok_type,
        begunok_quantity: payload.data.provide.begunok_quantity,
        latun_name: payload.data.provide.latun_name,
        latun_type: payload.data.provide.latun_type,
        latun_quantity: payload.data.provide.latun_quantity,
        delivery_time_provide: payload.data.provide.delivery_time_provide,
      },
      delivery_time_provide: payload.data.provide.delivery_time_provide,
    };
    // await provideModel.create(newData);
  }

  async CreateDayReport(payload) {
    try {
      const author = payload.user.id;
      const data = payload.data;

      const res = await DayReportSpinningPlan.create({ ...data, author });
      return { msg: "Muvaffaqiyatli qo'shildi!" };
    } catch (error) {
      return error.message;
    }
  }
  async GetDayReport(payload) {
    try {
      const author = new mongoose.Types.ObjectId(payload.user.id);
      const order_number = payload.data.order_number;

      const res = await DayReportSpinningPlan.aggregate([
        {
          $match: {
            $and: [{ order_number: order_number }, { author: author }],
          },
        },
      ]);

      return { status: 200, res };
    } catch (error) {
      return error.message;
    }
  }
  async GetOneFromWeaving(data) {
    if (data.report) {
      const card = await InputSpinningPlanModel.findById(data.id);
      return card;
    } else {
      const card = await InputWeavingPlanModel.findById(data.id);

      return card;
    }
  }
}

module.exports = new DepSpinningService();
