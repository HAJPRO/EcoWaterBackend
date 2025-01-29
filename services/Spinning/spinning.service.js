const mongoose = require("mongoose")
const SaleLegalCardModel = require("../../models/Sale/SaleCard.model.js");
const SaleDepSpinningCardModel = require("../../models/SaleDepSpinningCardModel.model.js");
const userModel = require("../../models/user.model.js");
const SaleDepProvideCardModel = require("../../models/saleDepProvideCard.model.js");
const SaleDepWeavingCardModel = require("../../models/saleDepWeavingCard.model");
const InProcessSpinningModel = require("../../models/Spinning/InProcessSpinningModel.model.js");

// const fileService = require("./file.service");

class DepSpinningService {
  async getModel() {
    const model = {
      begunok: "",
      latun: "",
    };
    return model;
  }


  async getAllLength(data) {
    const user_id = new mongoose.Types.ObjectId(data.user.id);
    const department = data.user.department;
    const process_length = await this.getAllInProcess(user_id).then((data) => data.length)
    const weaving_length = await this.AllSentFromWeaving().then((data) => data.length)
    const provide_length = await this.AllSentToProvide({ id: user_id, department }).then((data) => data.length)
    return { process_length, weaving_length, provide_length }
  }
  async getAll(data) {
    const is_status = data.status.status;
    const user_id = new mongoose.Types.ObjectId(data.user.id);
    const department = data.user.department;
    try {
      const all_length = await this.getAllLength(data)
      if (is_status === 1) {
        const items = await this.getAllInProcess(user_id);
        return { items, all_length }
      }
      if (is_status === 4) {
        const items = await this.AllSentFromWeaving();
        return { items, all_length }
      }

      if (is_status === 5) {
        const items = await this.AllSentToProvide({ id: user_id, department });
        return { items, all_length }
      }
    } catch (error) {
      return error.message;
    }
  }
  async getAllInProcess(id) {
    try {
      const allInProcess = await SaleDepSpinningCardModel.aggregate([
        { $match: { author: id } },
        {
          $lookup: {
            from: "salecards",
            localField: "sale_order_id",
            foreignField: "_id",
            as: "sale_order",
          },
        },
        {
          $lookup: {
            from: "depweavingcards",
            localField: "weaving_id",
            foreignField: "_id",
            as: "more",
          },
        },
        {
          $project: {
            status_inprocess: 1,
            more: {
              $cond: {
                if: { $isArray: "$more" },
                then: { $arrayElemAt: ["$more", 0] },
                else: null,
              },
            },
            sale_order: {
              $cond: {
                if: { $isArray: "$sale_order" },
                then: { $arrayElemAt: ["$sale_order", 0] },
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

  async AllSentFromWeaving() {
    try {
      const allWeaving = await SaleDepWeavingCardModel.aggregate([
        { $match: { status_spinning: "Yigiruvga yuborildi" } },
        {
          $lookup: {
            from: "salecards",
            localField: "sale_order_id",
            foreignField: "_id",
            as: "in_process_detail",
          },
        },
        {
          $project: {
            status_spinning: 1,
            spinning_delivery_time: 1,
            spinning_yarn_wrap_quantity: 1,
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

      return allWeaving;
    } catch (error) {
      return error.message;
    }
  }

  async AllSentToProvide(data) {
    try {
      const allProvide = await SaleDepProvideCardModel.aggregate([
        {
          $match: {
            $and: [{ author: data.id }, { department: data.department }],
          },
        },
      ]);
      return allProvide;
    } catch (error) {
      return error.message;
    }
  }

  async delete(id) {
    const data = await SaleDepSpinningCardModel.findByIdAndDelete(id);
    return data;
  }

  async edit(data, id) {
    if (!id) {
      console.log("Id not found");
    }

    const updatedData = await SaleDepSpinningCardModel.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
      }
    );
    return updatedData;
  }

  async getOne(payload) {
    const ID = new mongoose.Types.ObjectId(payload.id);
    try {
      const data = await SaleDepWeavingCardModel.aggregate([
        { $match: { _id: ID } },
        {
          $lookup: {
            from: "salecards",
            localField: "sale_order_id",
            foreignField: "_id",
            as: "in_process_detail",
          },
        },
        {
          $project: {
            status_spinning: 1,
            spinning_delivery_time: 1,
            spinning_yarn_wrap_quantity: 1,
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
      console.log(data);
      return data;
    } catch (error) {
      return error.message;
    }
  }

  async getOneFromInProcess(payload) {
    let ID = new mongoose.Types.ObjectId(payload.id);
    const data = await SaleDepSpinningCardModel.aggregate([{ $match: { _id: ID } }, {
      $lookup: {
        from: "inprocessspinningmodels",
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
      }

    },
    {
      $lookup: {
        from: "depweavingcards",
        localField: "weaving_id",
        foreignField: "_id",
        as: "weaving_data",
      }

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
        weaving_data: {
          $cond: {
            if: { $isArray: "$weaving_data" },
            then: { $arrayElemAt: ["$weaving_data", 0] },
            else: null,
          },
        },

      },
    },

    ]);
    console.log({ report: data[0].report.order_report_at_progress, sale_order_id: data[0].sale_order_id, order_number: data[0].order.order_number, customer_name: data[0].order.customer_name, quantity: data[0].weaving_data.spinning_yarn_wrap_quantity, delivery_time: data[0].weaving_data.spinning_delivery_time });
    return { report: data[0].report.order_report_at_progress, sale_order_id: data[0].sale_order_id, order_number: data[0].order.order_number, customer_name: data[0].order.customer_name, quantity: data[0].weaving_data.spinning_yarn_wrap_quantity, delivery_time: data[0].weaving_data.spinning_delivery_time };

  }


}

module.exports = new DepSpinningService();
