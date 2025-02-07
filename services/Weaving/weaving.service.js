const mongoose = require("mongoose");
const SaleDepWeavingCardModel = require("../../models/saleDepWeavingCard.model");
const InputPaintPlan = require("../../models/Paint/plan/InputPaintPlan.model");
const InputWeavingPlan = require("../../models/Weaving/InputWeavingPlan.model");
const ProvideModel = require("../../models/Provide/provide.model");
const DayReportWeavingPlan = require("../../models/Weaving/DayReport.model");
const DayReportSpinningPlan = require("../../models/Spinning/DayReport.model");
const SaleCardModel = require("../../models/Sale/SaleCard.model");
const InputWeavingPlanModel = require("../../models/Weaving/InputWeavingPlan.model");
const InputPaintPlanModel = require("../../models/Paint/plan/InputPaintPlan.model");

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
    const user_id = data.user.id;
    const department = data.user.department;
    const process_length = await this.getAllInProcess(user_id).then((data) => {
      if (data) {
        return data.length;
      } else {
        return 0;
      }
    });
    const paint_length = await this.AllSentFromPaint().then((data) => {
      if (data) {
        return data.length;
      } else {
        return 0;
      }
    });
    const provide_length = await this.AllSentToProvide(user_id).then((data) => {
      if (data) {
        return data.length;
      } else {
        return 0;
      }
    });

    return { process_length, paint_length, provide_length };
  }
  async getAll(data) {
    const is_status = data.status.is_active;
    const user_id = data.user.id;
    const department = data.user.department;
    try {
      if (is_status === 1) {
        const all_length = await this.getAllLength(data);
        const items = await this.getAllInProcess(user_id);
        return { items, all_length };
      }
      if (is_status === 2) {
        const all_length = await this.getAllLength(data);
        const items = await this.AllSentFromPaint();
        return { items, all_length };
      }

      if (is_status === 3) {
        const all_length = await this.getAllLength(data);
        const items = await this.AllSentToProvide(user_id);
        return { items, all_length };
      }
    } catch (error) {
      return error.message;
    }
  }
  async getAllInProcess(id) {
    try {
      const allInProcess = await InputWeavingPlan.find({
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
        paint_status: "To'quvga yuborildi",
      });
      return all;
    } catch (error) {
      return error.message;
    }
  }
  async AllSentToProvide(user_id) {
    try {
      const allProvide = await InputWeavingPlan.find({
        author: user_id,
      });

      return allProvide;
    } catch (error) {
      return error.message;
    }
  }
  async AcceptAndCreate(payload) {
    try {
      this.CreateInputWeavingPlan(payload);
      return { status: 200, msg: "Muvaffaqiyatli qabul qilindi!" };
    } catch (error) {
      return error.message;
    }
  }
  async CreateInputWeavingPlan(payload) {
    const initialValue = 0;
    const total_spinning = payload.data.provide.spinning.reduce(
      (accumulator, currentValue) =>
        accumulator + Number(currentValue.yarn_quantity),
      initialValue
    );
    const SaleCard = await SaleCardModel.findOne({
      order_number: payload.data.card.order_number,
    });

    const newCard = SaleCard;
    const proccess_status_sale = {
      department: payload.user.department,
      author: payload.user.username,
      is_confirm: { status: true, reason: "" },
      status: "Yigiruvga yuborildi",
      sent_time: new Date(),
    };
    newCard.process_status.push(proccess_status_sale);
    await SaleCardModel.findByIdAndUpdate(newCard._id, newCard, {
      new: true,
    });
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
    NewData.paint_status = "To'quv qabul qildi";
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
      spinning_products: payload.data.provide.spinning,
      paint_products: payload.data.card.weaving_products,
      delivery_time_paint: payload.data.card.delivery_time_weaving,
      delivery_time_spinning:
        payload.data.provide.spinning[0].delivery_time_spinning,
    };
    const res = await InputWeavingPlan.create(info);
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
      const spinning = await DayReportSpinningPlan.find({
        order_number: order_number,
      });
      const weaving = await DayReportWeavingPlan.aggregate([
        {
          $match: {
            $and: [{ order_number: order_number }, { author: author }],
          },
        },
      ]);
      this.FinishDayReport({ data: weaving, user: payload.user });
      return { status: 200, weaving, spinning };
    } catch (error) {
      return error.message;
    }
  }
  async FinishDayReport(payload) {
    if (payload.data.length > 0) {
      const id = payload.data[0].input_plan_id;
      const WeavingCard = await InputWeavingPlanModel.findById(id);
      const SaleCard = await SaleCardModel.findOne({
        order_number: payload.data[0].order_number,
      });
      const PaintCard = await InputPaintPlanModel.findOne({
        order_number: payload.data[0].order_number,
      });

      const initialValueWeaving = 0;
      const DoneWeaving = payload.data.reduce(
        (a, b) => a + Number(b.quantity),
        initialValueWeaving
      );

      if (DoneWeaving === WeavingCard.weaving_quantity) {
        const NewWeaving = WeavingCard;
        const NewSale = SaleCard;
        const NewPaint = PaintCard;
        const proccess_status = {
          department: payload.user.department,
          author: payload.user.username,
          is_confirm: { status: true, reason: "" },
          status: "To'quv yakunladi",
          sent_time: new Date(),
        };
        NewPaint.process_status.push(proccess_status);
        // NewPaint.status = "Yigiruv yakunladi";
        NewSale.process_status.push(proccess_status);
        NewSale.status = "To'quv yakunladi";
        NewWeaving.process_status.push(proccess_status);
        NewWeaving.status = "To'quv yakunladi";
        await InputWeavingPlanModel.findByIdAndUpdate(id, NewWeaving, {
          new: true,
        });
        await SaleCardModel.findByIdAndUpdate(SaleCard._id, NewSale, {
          new: true,
        });
        await InputPaintPlanModel.findByIdAndUpdate(PaintCard._id, NewPaint, {
          new: true,
        });
      }
    } else {
      return { status: 400, msg: "To'quvda xatolik yuz berdi!" };
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
