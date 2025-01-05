const mongoose = require("mongoose");
const SaleLegalCardModel = require("../models/saleLegalCard.model");
const XLSX = require("xlsx");
const randomstring = require("randomstring");
const InProcessPaintModel = require("../models/Paint/InProcess.model");
const SaleDepPaintCardModel = require("../models/saleDepPaintCard.model");
const SaleDepWeavingCardModel = require("../models/saleDepWeavingCard.model");
const SaleDepSpinningCardModel = require("../models/SaleDepSpinningCardModel.model");

class SaleLegalService {
  async getModel() {
    const order_num = randomstring.generate({
      length: 8,
      charset: ["numeric"],
    });
    const model = {
      customer_name: "",
      order_number: order_num,
      pro_name: "",
      pro_type: "",
      pro_color: "",
      pro_width: "",
      grammaj: "",
      order_quantity: "",
      unit: "",
      delivery_time: "",
    };

    return model;
  }
  async create(data, author) {
    const {
      customer_name,
      order_number,
      pro_name,
      pro_type,
      pro_color,
      pro_width,
      grammaj,
      delivery_time,
      order_quantity,
    } = data;
    if (
      customer_name &&
      order_number &&
      pro_name &&
      pro_type &&
      pro_color &&
      pro_width &&
      grammaj &&
      delivery_time &&
      order_quantity
    ) {
      const newData = await SaleLegalCardModel.create({ ...data, author });
      return {
        status: 200,
        msg: "Sotuv karta  yaratildi !",
        newData,
      };
    } else {
      return {
        status: 400,
        msg: "Barcha qatorlarni to'ldiring !",
      };
    }
  }

  async confirm(id) {
    const dataById = await SaleLegalCardModel.findById(id).populate("author");
    const data = dataById;
    data.in_department_order = "Bo'yoq";
    data.order_status = "Bo'yoqqa yuborildi";
    data.isConfirm = "Sotuv tasdiqladi";
    const proccess_status = {
      department: data.author.department,
      author: data.author.username,
      is_confirm: { status: true, reason: "" },
      status: "Bo'yoqqa yuborildi",
      sent_time: new Date(),
    };
    data.process_status.push(proccess_status);
    const updatedData = await SaleLegalCardModel.findByIdAndUpdate(id, data, {
      new: true,
    });
    return updatedData;
  }
  async AllOrderProccessById(id) {
    try {
      let ID = new mongoose.Types.ObjectId(id);
      const order = await SaleLegalCardModel.aggregate([
        { $match: { _id: ID } },
        {
          $project: {
            process_status: 1,
            order_quantity: 1,
            customer_name: 1,
            order_number: 1,
          },
        },
      ]);
      const dep_id = await SaleLegalCardModel.aggregate([
        { $match: { _id: ID } },
        {
          $project: {
            dep_paint_data: 1,
            dep_weaving_data: 1,
            dep_spinning_data: 1,
          },
        },
      ]);

      const paint_id = dep_id[0].dep_paint_data;
      const weaving_id = dep_id[0].dep_weaving_data;
      const spinning_id = dep_id[0].dep_spinning_data;
      const paint = await SaleDepPaintCardModel.aggregate([
        { $match: { _id: paint_id } },
        {
          $lookup: {
            from: "inprocesspaintmodels",
            localField: "in_process_id",
            foreignField: "_id",
            as: "paint_report",
          },
        },
        {
          $project: {
            weaving_delivery_time: 1,
            weaving_cloth_quantity: 1,
            paint_report: {
              $cond: {
                if: { $isArray: "$paint_report" },
                then: { $arrayElemAt: ["$paint_report", 0] },
                else: null,
              },
            },
          },
        },
      ]);
      const weaving = await SaleDepWeavingCardModel.aggregate([
        { $match: { _id: weaving_id } },
        {
          $lookup: {
            from: "inprocessweavingmodels",
            localField: "in_process_id",
            foreignField: "_id",
            as: "weaving_report",
          },
        },
        {
          $project: {
            weaving_report: {
              $cond: {
                if: { $isArray: "$weaving_report" },
                then: { $arrayElemAt: ["$weaving_report", 0] },
                else: null,
              },
            },
          },
        },
      ]);
      const spinning = await SaleDepSpinningCardModel.aggregate([
        { $match: { _id: spinning_id } },
        {
          $lookup: {
            from: "inprocessspinningmodels",
            localField: "in_process_id",
            foreignField: "_id",
            as: "spinning_report",
          },
        },
        {
          $project: {
            spinning_report: {
              $cond: {
                if: { $isArray: "$spinning_report" },
                then: { $arrayElemAt: ["$spinning_report", 0] },
                else: null,
              },
            },
          },
        },
      ]);

      return { order, paint, weaving, spinning };
    } catch (error) {
      return error.message;
    }
  }
  async getAllLength(id) {
    const sale_length = (await SaleLegalCardModel.find({ author: id })).length;
    const paint_length = (
      await SaleLegalCardModel.find({
        $and: [
          { $and: [{ author: id }, { order_status: "Bo'yoqqa yuborildi" }] },
        ],
      })
    ).length;
    const weaving_length = (
      await SaleLegalCardModel.find({
        $and: [
          { author: id },
          { order_status: "To'quvga yuborildi" },
          { order_status: "To'quv bekor qildi" },
        ],
      })
    ).length;
    const spinning_length = (
      await SaleLegalCardModel.find({
        $and: [
          { author: id },
          { order_status: "Yigiruvga yuborildi" },
          { order_status: "Yigiruv bekor qildi" },
        ],
      })
    ).length;
    const provide_length = (
      await SaleLegalCardModel.find({
        $and: [
          { author: id },
          { order_status: "Taminotga yuborildi" },
          { order_status: "Tamin bekor qildi" },
        ],
      })
    ).length;
    return {
      sale_length,
      paint_length,
      weaving_length,
      spinning_length,
      provide_length,
    };
  }

  async getAll(status, user) {
    const is_status = status.status;
    const user_id = user.id;
    const department = user.department;
    try {
      if (is_status === 0) {
        return await this.getAllInProcess(department);
      } else if (is_status === 1) {
        return await this.getAllSale(user_id);
      } else if (is_status === 2) {
        return await this.getAllPaint(user_id);
      } else if (is_status === 3) {
        return await this.getAllWeaving(user_id);
      } else if (is_status === 4) {
        return await this.getAllSpinning(user_id);
      } else if (is_status === 5) {
        return await this.getAllProvide(user_id);
      }
    } catch (error) {
      return error.message;
    }
  }
  async getAllInProcess(department) {
    try {
      const allInProcess = await InProcessPaintModel.aggregate([
        { $match: { department: department } },
        {
          $lookup: {
            from: "salecards",
            localField: "order_id",
            foreignField: "_id",
            as: "in_process_detail",
          },
        },
        {
          $project: {
            status: 1,
            in_process_detail: {
              $cond: {
                if: { $isArray: "$in_process_detail" },
                then: { $arrayElemAt: ["$in_process_detail", 0] },
                else: null,
              },
            },
          },
        },
      ]);
      return allInProcess;
    } catch (error) {
      return error.message;
    }
  }
  async getAllSale(user_id) {
    try {
      const all = await SaleLegalCardModel.find({ author: user_id });
      const length = all ? all.length : 0;
      return { all, length };
    } catch (error) {
      return error.message;
    }
  }
  async getAllPaint(user_id) {
    try {
      const all = await SaleLegalCardModel.find({
        $and: [{ author: user_id }, { order_status: "Bo'yoqqa yuborildi" }],
      }).populate([
        "author",
        "dep_paint_data",
        "dep_provider_data",
        "dep_weaving_data",
      ]);
      const length = all ? all.length : 0;
      return { all, length };
    } catch (error) {
      return error.message;
    }
  }
  async getAllSpinning() {
    try {
      const allSpinning = await SaleLegalCardModel.find({
        $or: [
          { in_department_order: "Yigiruv" },
          { order_status: "Yigiruvga yuborildi" },
          { isConfirm: "Yigiruv bekor qildi" },
        ],
      }).populate([
        "author",
        "dep_paint_data",
        "dep_provider_data",
        "dep_weaving_data",
      ]);
      return allSpinning;
    } catch (error) {
      return error.message;
    }
  }
  async getAllWeaving() {
    try {
      const allWeaving = await SaleLegalCardModel.find({
        $or: [
          { in_department_order: "To'quv" },
          { order_status: "To'quv yuborildi" },
          { isConfirm: "To'quv bekor qildi" },
        ],
      }).populate([
        "author",
        "dep_paint_data",
        "dep_provider_data",
        "dep_weaving_data",
      ]);
      return allWeaving;
    } catch (error) {
      return error.message;
    }
  }
  async getAllProvide() {
    try {
      const allProvide = await SaleLegalCardModel.find({
        order_status: "Taminotga yuborildi",
      }).populate([
        "author",
        "dep_paint_data",
        "dep_provider_data",
        "dep_weaving_data",
      ]);
      return allProvide;
    } catch (error) {
      return error.message;
    }
  }

  async delete(id) {
    const data = await SaleLegalCardModel.findByIdAndDelete(id);
    return data;
  }

  async edit(data, id) {
    const updatedData = await SaleLegalCardModel.findByIdAndUpdate(id, data, {
      new: true,
    });
    return updatedData;
  }

  async getOne(id) {
    const data = await SaleLegalCardModel.findById(id);

    return data;
  }
}

module.exports = new SaleLegalService();
