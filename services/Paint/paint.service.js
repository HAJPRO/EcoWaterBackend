const mongoose = require("mongoose");
const SaleCardModel = require("../../models/Sale/SaleCard.model.js");
const SaleDepPaintCardModel = require("../../models/saleDepPaintCard.model");
const InputPaintPlanModel = require("../../models/Paint/plan/InputPaintPlan.model.js");
const ProvideModel = require("../../models/Provide/provide.model.js");
const DayReportPaintPlan = require("../../models/Paint/plan/DayReport.model.js");
const DayReportWeavingPlan = require("../../models/Weaving/DayReport.model.js");

// const fileService = require("./file.service");

class DepPaintService {
  async getModel() {
    const ModelForProvide = {
      pus: "",
      fike: "",
      color_code: "",
      duration_time: "",
    };
    const ModelForWeaving = {
      weaving_cloth_quantity: "",
      weaving_delivery_time: "",
    };

    return { ModelForProvide, ModelForWeaving };
  }

  async GetOneOrderReport(data) {
    let ID = new mongoose.Types.ObjectId(data.id.id);
    let user_id = new mongoose.Types.ObjectId(data.user.id);
    const card = await InputPaintPlanModel.aggregate([
      {
        $match: {
          $and: [{ author: user_id }, { _id: ID }],
        },
      },
    ]);

    return card;
  }
  async AcceptAndCreate(payload) {
    try {
      this.CreateInputPaintPlan(payload);
      this.CreateProvide(payload);
      return { status: 200, msg: "Muvaffaqiyatli qabul qilindi!" };
    } catch (error) {
      return error.message;
    }
  }
  async CreateInputPaintPlan(payload) {
    const saleCard = await SaleCardModel.findById(payload.data.items._id);
    const NewData = saleCard;
    const proccess_status = {
      department: payload.user.department,
      author: payload.user.username,
      is_confirm: { status: true, reason: "" },
      status: "To'quvga yuborildi",
      sent_time: new Date(),
    };
    NewData.process_status.push(proccess_status);
    NewData.status = "To'quvga yuborildi";
    await SaleCardModel.findByIdAndUpdate(payload.data.items._id, NewData, {
      new: true,
    });

    const info = {
      author: payload.user.id,
      customer_name: payload.data.items.customer_name,
      order_number: payload.data.items.order_number,
      artikul: payload.data.items.artikul,
      weaving_quantity: payload.data.provide.weaving_quantity, // total weaving
      weaving_products: payload.data.provide.weaving, // weaving-product
      sale_products: payload.data.items.sale_products, // sale-product
      delivery_time_sale: payload.data.items.delivery_time,
      delivery_time_weaving: payload.data.provide.delivery_time_weaving,
      sale_quantity: payload.data.items.order_quantity, // total sale
    };

    const res = await InputPaintPlanModel.create(info);
  }
  async CreateProvide(payload) {
    const newData = {
      author: payload.user.id,
      department: payload.user.department,
      delivery_product_box: payload.data.provide.products,
      delivery_time_provide:
        payload.data.provide.products[0].delivery_time_provide,
    };

    await ProvideModel.create(newData);
  }

  async CreateDayReport(payload) {
    try {
      const author = payload.user.id;
      const data = payload.data;

      const res = await DayReportPaintPlan.create({ ...data, author });
      return { msg: "Muvaffaqiyatli qo'shildi!" };
    } catch (error) {
      return error.message;
    }
  }
  async GetDayReport(payload) {
    try {
      const author = new mongoose.Types.ObjectId(payload.user.id);
      const order_number = payload.data.order_number;
      const weaving = await DayReportWeavingPlan.find({
        order_number: order_number,
      });
      const paint = await DayReportPaintPlan.aggregate([
        {
          $match: {
            $and: [{ order_number: order_number }, { author: author }],
          },
        },
      ]);
      this.FinishDayReport({ data: paint, user: payload.user });
      return { status: 200, weaving, paint };
    } catch (error) {
      return error.message;
    }
  }
  async FinishDayReport(payload) {
    if (payload.data.length > 0) {
      const id = payload.data[0].input_plan_id;
      const PaintCard = await InputPaintPlanModel.findById(id);
      const SaleCard = await SaleCardModel.findOne({
        order_number: payload.data[0].order_number,
      });

      const initialValuePaint = 0;
      const DonePaint = payload.data.reduce(
        (a, b) => a + Number(b.quantity),
        initialValuePaint
      );

      if (DonePaint === PaintCard.sale_quantity) {
        const NewSale = SaleCard;
        const NewPaint = PaintCard;
        const proccess_status = {
          department: payload.user.department,
          author: payload.user.username,
          is_confirm: { status: true, reason: "" },
          status: "Bo'yoq yakunladi",
          sent_time: new Date(),
        };
        NewPaint.process_status.push(proccess_status);
        NewPaint.status = "Bo'yoq yakunladi";
        NewSale.process_status.push(proccess_status);
        NewSale.status = "Bo'yoq yakunladi";

        await SaleCardModel.findByIdAndUpdate(SaleCard._id, NewSale, {
          new: true,
        });
        await InputPaintPlanModel.findByIdAndUpdate(PaintCard._id, NewPaint, {
          new: true,
        });
      }
    } else {
      return { status: 400, msg: "Bo'yoqda xatolik yuz berdi!" };
    }
  }
  async getAllLength(data) {
    const user_id = data.user.id;
    const department = data.user.department;
    const process_length = await this.getAllInProcess(user_id).then(
      (data) => data.length
    );
    const sale_length = await this.AllSentToPaint().then((data) => data.length);

    const provide_length = await this.AllSentToProvide({
      id: user_id,
      department,
    }).then((data) => data.length);
    return { process_length, sale_length, provide_length };
  }

  async getAll(data) {
    const is_status = data.status.status;
    const user_id = data.user.id;
    const department = data.user.department;
    try {
      const all_length = await this.getAllLength(data);
      if (is_status === 1) {
        const items = await this.getAllInProcess(user_id);
        return { items, all_length };
      }
      if (is_status === 2) {
        const items = await this.AllSentToPaint();
        return { items, all_length };
      }

      if (is_status === 5) {
        const items = await this.AllSentToProvide({ id: user_id, department });
        return { items, all_length };
      }
    } catch (error) {
      return error.message;
    }
  }
  async getAllInProcess(user_id) {
    let ID = new mongoose.Types.ObjectId(user_id);
    try {
      const allInProcess = await InputPaintPlanModel.find({ author: ID });
      return allInProcess;
    } catch (error) {
      return error.message;
    }
  }

  async AllSentToPaint() {
    try {
      const all = await SaleCardModel.find({
        status: "Bo'yoqqa yuborildi",
      });

      return all;
    } catch (error) {
      return error.message;
    }
  }

  async AllSentToProvide(data) {
    let ID = new mongoose.Types.ObjectId(data.id);
    try {
      // const allProvide = await ProvideModel.find();
      const allProvide = await ProvideModel.aggregate([
        {
          $match: {
            $and: [{ author: ID }, { department: "Bo'yoq" }],
          },
        },
      ]);

      return allProvide;
    } catch (error) {
      return error.message;
    }
  }
  async GetOneFromSale(data) {
    // let ID = new mongoose.Types.ObjectId(id);
    try {
      if (data.report === true) {
        const card = await InputPaintPlanModel.findById(data.id);
        return card;
      } else {
        const card = await SaleCardModel.findById(data.id);
        return card;
      }
    } catch (error) {
      return error.message;
    }
  }
  async delete(id) {
    const data = await SaleDepPaintCardModel.findByIdAndDelete(id);
    return data;
  }

  async edit(data, id) {
    if (!id) {
      console.log("Id not found");
    }

    const updatedData = await SaleDepPaintCardModel.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
      }
    );
    return updatedData;
  }
}

module.exports = new DepPaintService();
