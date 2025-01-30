const mongoose = require("mongoose");
const SaleDepWeavingCardModel = require("../../models/saleDepWeavingCard.model");
const InputPaintPlan = require("../../models/Paint/plan/InputPaintPlan.model");
const InputWeavingPlan = require("../../models/Weaving/InputWeavingPlan.model");
const ProvideModel = require("../../models/Provide/provide.model");
const DayReportWeavingPlan = require("../../models/Weaving/DayReport.model");

// const fileService = require("./file.service");
class DepWeavingService {
  async getModel() {
    const ModelForProvide = {
      likra: "",
      polister: "",
      melaks_yarn: "",
      duration_time: "",
    };
    const ModelForSpinning = {
      spinning_yarn_wrap_quantity: "",
      spinning_delivery_time: "",
    };

    return { ModelForProvide, ModelForSpinning };
  }

  async getAllLength(data) {
    const user_id = new mongoose.Types.ObjectId(data.user.id);
    const department = data.user.department;
    const process_length = await this.getAllInProcess(user_id).then(
      (data) => data.length
    );
    const paint_length = await this.AllSentFromPaint().then(
      (data) => data.length
    );
    const provide_length = await this.AllSentToProvide({
      id: user_id,
      department,
    }).then((data) => data.length);
    return { process_length, paint_length, provide_length };
  }
  async getAll(data) {
    const is_status = data.status.is_active;
    const user_id = new mongoose.Types.ObjectId(data.user.id);
    const department = data.user.department;
    try {
      const all_length = await this.getAllLength(data);
      if (is_status === 1) {
        const items = await this.getAllInProcess(user_id);
        return { items, all_length };
      }
      if (is_status === 2) {
        const items = await this.AllSentFromPaint();
        return { items, all_length };
      }

      if (is_status === 3) {
        const items = await this.AllSentToProvide({ id: user_id, department });
        return { items, all_length };
      }
    } catch (error) {
      return error.message;
    }
  }
  async getAllInProcess(id) {
    try {
      const allInProcess = await InputWeavingPlan.find({
        status: "Jarayonda",
        author: id,
      });

      return allInProcess;
    } catch (error) {
      return error.message;
    }
  }
  async AllSentFromPaint() {
    try {
      const all = await InputPaintPlan.find({
        status: "Jarayonda",
      });
      return all;
    } catch (error) {
      return error.message;
    }
  }
  async AllSentToProvide(data) {
    try {
      const allProvide = await ProvideModel.aggregate([
        {
          $match: {
            $and: [{ author: data.user_id }, { department: "To'quv" }],
          },
        },
      ]);
      return allProvide;
    } catch (error) {
      return error.message;
    }
  }
  async AcceptAndCreate(payload) {
    try {
      this.CreateInputWeavingPlan(payload);
      this.CreateProvide(payload);
      return { status: 200, msg: "Muvaffaqiyatli qabul qilindi!" };
    } catch (error) {
      return error.message;
    }
  }
  async CreateInputWeavingPlan(payload) {
    const initialValue = 0;
    const total_spinning = payload.data.spinning.reduce(
      (accumulator, currentValue) =>
        accumulator + Number(currentValue.yarn_quantity),
      initialValue
    );

    const InputPaint = await InputPaintPlan.findById(payload.data.card._id);
    const NewData = InputPaint;
    const proccess_status = {
      department: payload.user.department,
      author: payload.user.username,
      is_confirm: { status: true, reason: "" },
      status: "Yigiruvga yuborildi",
      sent_time: new Date(),
    };
    NewData.process_status.push(proccess_status);
    NewData.status = "Yigiruvga yuborildi";
    await InputPaintPlan.findByIdAndUpdate(payload.data.card._id, NewData, {
      new: true,
    });
    const info = {
      author: payload.user.id,
      customer_name: payload.data.card.customer_name,
      order_number: payload.data.card.order_number,
      artikul: payload.data.card.artikul,
      spinning_quantity: total_spinning,
      weaving_quantity: payload.data.card.weaving_quantity,
      spinning_products: payload.data.spinning,
      paint_products: payload.data.card.weaving_products,
      delivery_time_paint: payload.data.card.delivery_time_weaving,
      delivery_time_spinning: payload.data.spinning[0].delivery_time_spinning,
    };

    const res = await InputWeavingPlan.create(info);
    console.log(res);
  }
  async CreateProvide(payload) {
    payload.data.products.forEach((item) => {
      let product = {
        author: payload.user.id,
        department: payload.user.department,
        delivery_product_box: {
          likra_type: item.likra_type,
          likra_quantity: item.likra_quantity,
          melaks_type: item.melaks_type,
          melaks_quantity: item.melaks_quantity,
          polister_type: item.polister_type,
          polister_quantity: item.polister_quantity,
        },

        delivery_time_provide: item.delivery_time_provide,
      };
      ProvideModel.create(product);
    });
  }

  async delete(id) {
    const data = await SaleDepWeavingCardModel.findByIdAndDelete(id);
    return data;
  }

  async edit(data, id) {
    if (!id) {
      console.log("Id not found");
    }

    const updatedData = await SaleDepWeavingCardModel.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
      }
    );
    return updatedData;
  }
  async CreateDayReport(payload) {
    try {
      const author = payload.user.id;
      const data = payload.data;
      const res = await DayReportWeavingPlan.create({ ...data, author });
      return { msg: "Muvaffaqiyatli qo'shildi!" };
    } catch (error) {
      return error.message;
    }
  }
  async GetDayReport(payload) {
    try {
      const author = new mongoose.Types.ObjectId(payload.user.id);
      const order_number = payload.data.order_number;

      const res = await DayReportWeavingPlan.aggregate([
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
  async GetOneFromPaint(data) {
    // let ID = new mongoose.Types.ObjectId(id);
    try {
      if (data.report === true) {
        const card = await InputWeavingPlan.findById(data.id);
        return card;
      } else {
        const card = await InputPaintPlan.findById(data.id);
        return card;
      }
    } catch (error) {
      return error.message;
    }
  }
}

module.exports = new DepWeavingService();
