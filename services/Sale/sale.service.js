const mongoose = require("mongoose");
const SaleCardModel = require("../../models/Sale/SaleCard.model");

const XLSX = require("xlsx");
const randomstring = require("randomstring");
const InProcessPaintModel = require("../../models/Paint/plan/InputPaintPlan.model");
const DayReportPaint = require("../../models/Paint/plan/DayReport.model");
const DayReportWeaving = require("../../models/Weaving/DayReport.model");
const DayReportSpinning = require("../../models/Spinning/DayReport.model");
const InputPaintPlanModel = require("../../models/Paint/plan/InputPaintPlan.model");
const InputWeavingPlanModel = require("../../models/Weaving/InputWeavingPlan.model");
const InputSpinningPlanModel = require("../../models/Spinning/InputSpinningPlan.model");

class SaleLegalService {
  async GetCardModel() {
    const order_num = randomstring.generate({
      length: 8,
      charset: ["numeric"],
    });
    const model = {
      customer_name: "",
      order_number: order_num,
      material_name: "",
      material_type: "",
      artikul: "",
      color: "",
      width: "",
      grammage: "",
      order_quantity: "",
      unit: "",
      delivery_time: "",
    };

    return model;
  }
  async create(payload) {
    let initialValue = 0;
    const total = payload.data.products.reduce(
      (accumulator, currentValue) =>
        accumulator + Number(currentValue.order_quantity),
      initialValue
    );
    const info = {
      author: payload.user.id,
      customer_name: payload.data.customer_name,
      order_number: payload.data.order_number,
      artikul: payload.data.artikul,
      order_quantity: total,
      delivery_time: payload.data.delivery_time,
      sale_products: payload.data.products,
    };

    const res = await SaleCardModel.create(info);

    return { msg: "Sotuv karta yaratildi" };
  }
  async confirm(data) {
    const dataById = await SaleCardModel.findById(data.data.id);
    const NewData = dataById;

    const proccess_status = {
      department: data.user.department,
      author: data.user.username,
      is_confirm: { status: true, reason: "" },
      status: "Bo'yoqqa yuborildi",
      sent_time: new Date(),
    };
    NewData.process_status.push(proccess_status);
    NewData.status = "Bo'yoqqa yuborildi";
    const updatedData = await SaleCardModel.findByIdAndUpdate(
      data.data.id,
      NewData,
      {
        new: true,
      }
    );

    return updatedData;
  }
  async AllOrderProccessById(data) {
    try {
      let ID = new mongoose.Types.ObjectId(data.id);
      const SaleCard = await SaleCardModel.findById(data.id);
      const order_number = SaleCard.order_number;
      const ReportPaint = await DayReportPaint.find({
        order_number: order_number,
      });
      const ReportWeaving = await DayReportWeaving.find({
        order_number: order_number,
      });
      const ReportSpinning = await DayReportSpinning.find({
        order_number: order_number,
      });
      const PaintCard = await InputPaintPlanModel.findOne({
        order_number: order_number,
      });
      const WeavingCard = await InputWeavingPlanModel.findOne({
        order_number: order_number,
      });
      const SpinningCard = await InputSpinningPlanModel.findOne({
        order_number: order_number,
      });
      return {
        SaleCard,
        PaintCard,
        WeavingCard,
        SpinningCard,
        ReportPaint,
        ReportWeaving,
        ReportSpinning,
      };
    } catch (error) {
      return error.message;
    }
  }
  async getAllLength(data) {
    const user_id = new mongoose.Types.ObjectId(data.user.id);
    const department = data.user.department;
    const sale_length = await this.getAllSale(user_id).then((data) => {
      if (data) {
        return data.length;
      } else {
        return 0;
      }
    });
    const paint_length = await this.getAllPaint(user_id).then((data) => {
      if (data) {
        return data.length;
      } else {
        return 0;
      }
    });

    return {
      sale_length,
      paint_length,
    };
  }

  async getAll(data) {
    const is_status = data.status.status;
    const user_id = data.user.id;
    const department = data.user.department;
    try {
      if (is_status === 1) {
        const all_length = await this.getAllLength(data);
        const items = await this.getAllSale(user_id);
        return { items, all_length };
      } else if (is_status === 2) {
        const all_length = await this.getAllLength(data);
        const items = this.getAllPaint(user_id);
        return { items, all_length };
      }
    } catch (error) {
      return error.message;
    }
  }

  async getAllSale(user_id) {
    try {
      const allSale = await SaleCardModel.find({ author: user_id });

      return allSale;
    } catch (error) {
      return error.message;
    }
  }
  async getAllPaint(user_id) {
    try {
      const allPaint = await SaleCardModel.find({
        $and: [{ author: user_id }, { order_status: "Bo'yoqqa yuborildi" }],
      });
      return allPaint;
    } catch (error) {
      return error.message;
    }
  }

  async FinishParty(payload) {
    try {
      const SaleCard = await SaleCardModel.findById(payload.data.id);
      const NewSale = SaleCard;
      const proccess_status = {
        department: payload.user.department,
        author: payload.user.username,
        is_confirm: { status: true, reason: "" },
        status: "Sotuv yakunladi",
        sent_time: new Date(),
      };
      NewSale.process_status.push(proccess_status);
      NewSale.status = "Partya yakunlandi";
      await SaleCardModel.findByIdAndUpdate(payload.data.id, NewSale, {
        new: true,
      });
      return { status: 201, msg: "Partya muvaffaqiyatli yakunlandi!" };
    } catch (error) {
      return { status: 505, msg: "Xatolik yuz berdi!" };
    }
  }
  async delete(id) {
    const data = await SaleCardModel.findByIdAndDelete(id);
    return data;
  }

  async edit(data, id) {
    const updatedData = await SaleCardModel.findByIdAndUpdate(id, data, {
      new: true,
    });
    return updatedData;
  }

  async GetOne(data) {
    const card = await SaleCardModel.findById(data.id);
    return card;
  }
}

module.exports = new SaleLegalService();
