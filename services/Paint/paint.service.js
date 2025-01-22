const mongoose = require("mongoose");
const SaleCardModel = require("../../models/Sale/SaleCard.model.js");
const SaleDepPaintCardModel = require("../../models/saleDepPaintCard.model");
const SaleDepProvideCardModel = require("../../models/saleDepProvideCard.model.js");
const userModel = require("../../models/user.model");
const InputPaintPlanModel = require("../../models/Paint/plan/InputPaintPlan.model.js");
const InputPaintPlanProductsModel = require("../../models/Paint/plan/InputPaintPlanProducts.model.js");
const SaleDepWeavingCardModel = require("../../models/saleDepWeavingCard.model.js");
const SaleCardProductsModel = require("../../models/Sale/SaleCardProducts.model.js");
const ProvideModel = require("../../models/Provide/provide.model.js");

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
  async cancelReason(data, author) {
    try {
      const userData = await userModel.findById(author);
      const LegalDataById = await SaleCardModel.findById(data.card_id);
      const newLegalData = LegalDataById;
      newLegalData.order_status = "Bo'yoq bekor qildi";
      newLegalData.in_department_order = "Sotuv";
      newLegalData.isConfirm = "Bo'yoq bekor qildi";
      newLegalData.process_status.push({
        department: userData.department,
        author: userData.username,
        is_confirm: { status: false, reason: data.reason },
        status: "Bo'yoq bekor qildi",
        sent_time: new Date(),
      });

      if (data.card_id) {
        const updateDataLegal = await SaleCardModel.findByIdAndUpdate(
          data.card_id,
          newLegalData,
          { new: true }
        );
        return updateDataLegal;
      }
    } catch (error) {
      return error.message;
    }
  }
  async create(data, author) {
    try {
      if (data.items.ModelForProvide && data.items.ModelForWeaving) {
        const user = await userModel.findById(author);
        const newDataForProvide = {
          department: user.department,
          delivery_product_box: data.items.ModelForProvide,
          author: author,
          proccess_status: {
            confirm: true,
            reason: "",
            status: "Taminotga yuborildi",
          },
        };
        const provideData = await SaleDepProvideCardModel.create(
          newDataForProvide
        );

        if (provideData) {
          const provide_id = provideData._id;
          const paint_process_status = {
            author: author,
            is_confirm: { status: true, reason: "" },
            sent_time: new Date(),
          };
          const in_process_data = {
            author: author,
            order_id: data.card_id,
            department: user.department,
          };
          const inProcess = await InputPaintPlanModel.create(in_process_data);
          const Data = await SaleDepPaintCardModel.create({
            in_process_id: inProcess._id,
            author,
            sale_order_id: data.card_id,
            paint_process_status,
            provide_id,
            weaving_cloth_quantity:
              data.items.ModelForWeaving.weaving_cloth_quantity,
            weaving_delivery_time:
              data.items.ModelForWeaving.weaving_delivery_time,
          });
          const LegalDataById = await SaleCardModel.findById(data.card_id);
          const newLegalData = LegalDataById;
          newLegalData.order_status = "To'quvga yuborildi";
          newLegalData.in_department_order = "To'quv";
          newLegalData.isConfirm = "Bo'yoq tasdiqladi";
          newLegalData.process_status.push({
            department: user.department,
            author: user.username,
            is_confirm: { status: true, reason: "" },
            status: "To'quvga yuborildi",
            sent_time: new Date(),
          });

          if (Data._id) {
            newLegalData.dep_paint_data = Data._id;
            const updateDataLegal = await SaleCardModel.findByIdAndUpdate(
              data.card_id,
              newLegalData,
              { new: true }
            );
          }
        }
      }

      return provideData;
    } catch (error) {
      return error.message;
    }
  }
  async AcceptAndCreate(payload) {
    console.log(payload);
    try {
      this.CreateInputPaintPlan(payload);
      this.CreateProvide(payload);
      return { status: 200, msg: "Muvaffaqiyatli qabul qilindi!" };
    } catch (error) {
      return error.message;
    }
  }
  async CreateInputPaintPlan(payload) {
    let initialValue = 0;
    const total = payload.data.items.products.reduce(
      (accumulator, currentValue) =>
        accumulator + Number(currentValue.quantity),
      initialValue
    );
    const saleCard = await SaleCardModel.findById(payload.data.items.card._id);
    const NewData = saleCard;
    const proccess_status = {
      department: payload.user.department,
      author: payload.user.username,
      is_confirm: { status: true, reason: "" },
      status: "Toquvga yuborildi",
      sent_time: new Date(),
    };
    NewData.process_status.push(proccess_status);
    NewData.status = "To'quvga yuborildi";
    await SaleCardModel.findByIdAndUpdate(
      payload.data.items.card._id,
      NewData,
      {
        new: true,
      }
    );
    const info = {
      author: payload.user.id,
      customer_name: payload.data.items.card.customer_name,
      order_number: payload.data.items.card.order_number,
      artikul: payload.data.items.card.artikul,
      order_quantity: total,
      delivery_time_sale: payload.data.items.card.delivery_time,
      delivery_time_weaving: payload.data.provide.delivery_time_weaving,
      weaving_qauntity: payload.data.provide.weaving_qauntity,
    };

    const res = await InputPaintPlanModel.create(info);
    if (res) {
      await this.CreateInputPaintPlanProducts(res, payload);
    }
  }
  async CreateProvide(payload) {
    const newData = {
      author: payload.user.id,
      department: payload.user.department,
      delivery_product_box: {
        pus: payload.data.provide.pus,
        fike: payload.data.provide.fike,
        colors: payload.data.provide.colors,
        delivery_time_provide: payload.data.provide.delivery_time_provide,
      },
    };
    await ProvideModel.create(newData);
  }
  async CreateInputPaintPlanProducts(res, payload) {
    payload.data.items.products.forEach((item) => {
      let products = {
        input_plan_id: res._id,
        author: payload.user.id,
        id: item.id,
        product_name: item.product_name,
        product_type: item.product_type,
        color: item.color,
        width: item.width,
        grammage: item.grammage,
        quantity: item.quantity,
        unit: item.unit,
      };
      InputPaintPlanProductsModel.create(products);
    });
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
      const allInProcess = await InputPaintPlanModel.find({ author: user_id });

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
      const allProvide = await ProvideModel.find();
      // const allProvide = await ProvideModel.aggregate([
      //   {
      //     $match: {
      //       $and: [{ author: ID }, { department: data.department }],
      //     },
      //   },
      // ]);

      return allProvide;
    } catch (error) {
      return error.message;
    }
  }
  async GetOneFromSale(data) {
    const card = await SaleCardModel.findById(data.id);
    const products = await SaleCardProductsModel.find({ sale_id: data.id });

    return { card, products };
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

  async getOne(id) {
    const data = await SaleDepPaintCardModel.findById(id);
    return data;
  }
  async getOneFromInProcess(payload) {
    const data = await SaleDepPaintCardModel.findById(payload.id);
    if (data.sale_order_id) {
      const paint_data = await SaleDepPaintCardModel.findOne({
        sale_order_id: data.sale_order_id,
      });
      const item = await SaleDepWeavingCardModel.aggregate([
        { $match: { sale_order_id: data.sale_order_id } },
        {
          $lookup: {
            from: "inprocessweavingmodels",
            localField: "in_process_id",
            foreignField: "_id",
            as: "report",
          },
        },
        {
          $lookup: {
            from: "salecards",
            localField: "sale_order_id",
            foreignField: "_id",
            as: "order",
          },
        },
        {
          $project: {
            sale_order_id: 1,
            report: {
              $cond: {
                if: { $isArray: "$report" },
                then: { $arrayElemAt: ["$report", 0] },
                else: null,
              },
            },
            order: {
              $cond: {
                if: { $isArray: "$order" },
                then: { $arrayElemAt: ["$order", 0] },
                else: null,
              },
            },
          },
        },
      ]);
      if (item.length > 0) {
        return {
          sale_order_id: item[0].sale_order_id,
          report: item[0].report.order_report_at_progress,
          customer_name: item[0].order.customer_name,
          order_number: item[0].order.order_number,
          weaving_cloth_quantity: paint_data.weaving_cloth_quantity,
          weaving_delivery_time: paint_data.weaving_delivery_time,
        };
      }
    }
  }
  async addDayReportInProcess(data) {
    let order_report_at_progress = [];
    order_report_at_progress.push(data.items);
    const ID = data.id;
    const Data = await InputPaintPlanModel.findOne({ order_id: ID });
    const newData = Data;
    newData.order_report_at_progress.push(data.items);
    const updateData = await InputPaintPlanModel.findByIdAndUpdate(
      Data._id,
      newData,
      { new: true }
    );
    return updateData;
  }
  async getDayReportFromPaint(data) {
    let ID = new mongoose.Types.ObjectId(data.id);
    const paint = await SaleDepPaintCardModel.findOne({
      sale_order_id: data.id,
    });
    const item = await InputPaintPlanModel.aggregate([
      { $match: { order_id: ID } },
      {
        $lookup: {
          from: "salecards",
          localField: "order_id",
          foreignField: "_id",
          as: "order",
        },
      },
      {
        $project: {
          order_report_at_progress: 1,
          order: {
            $cond: {
              if: { $isArray: "$order" },
              then: { $arrayElemAt: ["$order", 0] },
              else: null,
            },
          },
        },
      },
    ]);

    if (item.length > 0) {
      return {
        report: item[0].order_report_at_progress,
        customer_name: item[0].order.customer_name,
        order_number: item[0].order.order_number,
        order_quantity: item[0].order.order_quantity,
        delivery_time: item[0].order.delivery_time,
        status: paint.status_inprocess,
      };
    }
  }
  async Finish(data) {
    const order_id = data.id.id;
    const author = data.user;
    const Data = await SaleDepPaintCardModel.findOne({
      sale_order_id: order_id,
    });
    const newData = Data;
    const process_status = {
      author,
      is_confirm: { status: true, reason: "Yakunlandi" },
      sent_time: new Date(),
    };
    newData.paint_process_status.push(process_status);
    newData.status_inprocess = "Yakunlandi";
    const updateData = await SaleDepPaintCardModel.findByIdAndUpdate(
      Data._id,
      newData,
      { new: true }
    );

    return updateData;
  }
}

module.exports = new DepPaintService();
