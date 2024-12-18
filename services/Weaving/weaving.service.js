const mongoose = require("mongoose");
const SaleLegalCardModel = require("../../models/saleLegalCard.model");
const SaleDepPaintCardModel = require("../../models/saleDepPaintCard.model");
const SaleDepWeavingCardModel = require("../../models/saleDepWeavingCard.model");
const userModel = require("../../models/user.model");
const SaleDepProvideCardModel = require("../../models/saleDepProvideCard.model");
const InProcessPaintModel = require("../../models/Paint/InProcess.model");
const InProcessWeavingModel = require("../../models/Weaving/InProcess.model");
const SaleDepSpinningCardModel = require("../../models/SaleDepSpinningCardModel.model");

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

  async cancelReason(data, author) {
    try {
      const userData = await userModel.findById(author);
      const LegalDataById = await SaleLegalCardModel.findById(data.card_id);
      const newLegalData = LegalDataById;
      newLegalData.order_status = "To'quv bekor qildi";
      newLegalData.in_department_order = "Bo'yoq";
      newLegalData.isConfirm = "To'quv bekor qildi";
      newLegalData.process_status.push({
        department: userData.department,
        author: userData.username,
        is_confirm: { status: false, reason: data.reason },
        status: "To'quv bekor qilindi",
        sent_time: new Date(),
      });

      if (data.card_id) {
        const updateDataLegal = await SaleLegalCardModel.findByIdAndUpdate(
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
      if (data.items.ModelForProvide && data.items.ModelForSpinning) {
        const user = await userModel.findById(author);
        const box_item = {
          likra: data.items.ModelForProvide.likra,
          polister: data.items.ModelForProvide.polister,
          melaks_yarn: data.items.ModelForProvide.melaks_yarn,
          duration_time: data.items.ModelForProvide.duration_time,
        };
        const newDataForProvide = {
          department: user.department,
          delivery_product_box: box_item,
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
          const weaving_process_status = {
            author: author,
            is_confirm: { status: true, reason: "" },
            sent_time: new Date(),
          };
          const in_process_data = {
            author: author,
            order_id: data.order_id,
            department: user.department,
          };
          const inProcess = await InProcessWeavingModel.create(in_process_data);
          const PaintData = await SaleDepPaintCardModel.findOne({
            sale_order_id: data.order_id,
          });
          const newPaintData = PaintData;
          newPaintData.status_weaving = "To'quv tasdiqladi";
          const updateInProcessPaint =
            await SaleDepPaintCardModel.findByIdAndUpdate(
              PaintData._id,
              newPaintData,
              { new: true }
            );
          const Data = await SaleDepWeavingCardModel.create({
            in_process_id: inProcess._id,
            author,
            sale_order_id: data.order_id,
            weaving_process_status,
            provide_id,
            spinning_yarn_wrap_quantity:
              data.items.ModelForSpinning.spinning_yarn_wrap_quantity,
            spinning_delivery_time:
              data.items.ModelForSpinning.spinning_delivery_time,
            paint_id: PaintData._id,
          });
          const LegalDataById = await SaleLegalCardModel.findById(
            data.order_id
          );
          const newLegalData = LegalDataById;
          newLegalData.order_status = "Yigiruvga yuborildi";
          newLegalData.in_department_order = "Yigiruv";
          newLegalData.isConfirm = "To'quv tasdiqladi";
          newLegalData.process_status.push({
            department: user.department,
            author: user.username,
            is_confirm: { status: true, reason: "" },
            status: "Yigiruvga yuborildi",
            sent_time: new Date(),
          });

          if (Data._id) {
            newLegalData.dep_weaving_data = Data._id;
            const updateDataLegal = await SaleLegalCardModel.findByIdAndUpdate(
              data.order_id,
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

      if (is_status === 5) {
        const items = await this.AllSentToProvide({ id: user_id, department });
        return { items, all_length };
      }
    } catch (error) {
      return error.message;
    }
  }
  async getAllInProcess(id) {
    try {
      const allInProcess = await SaleDepWeavingCardModel.aggregate([
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
            from: "deppaintcards",
            localField: "paint_id",
            foreignField: "_id",
            as: "paint",
          },
        },
        {
          $project: {
            status: 1,
            spinning_delivery_time: 1,
            spinning_yarn_wrap_quantity: 1,
            status_inprocess: 1,
            sale_order: {
              $cond: {
                if: { $isArray: "$sale_order" },
                then: { $arrayElemAt: ["$sale_order", 0] },
                else: null,
              },
            },
            paint: {
              $cond: {
                if: { $isArray: "$paint" },
                then: { $arrayElemAt: ["$paint", 0] },
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

  async AllSentFromPaint() {
    try {
      const allInProcess = await SaleDepPaintCardModel.aggregate([
        { $match: { status_weaving: "To'quvga yuborildi" } },
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
            weaving_delivery_time: 1,
            weaving_cloth_quantity: 1,
            status_weaving: 1,
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

  async getOne(id) {
    let ID = new mongoose.Types.ObjectId(id);
    try {
      const allInProcess = await SaleDepPaintCardModel.aggregate([
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
            status: 1,
            weaving_cloth_quantity: 1,
            weaving_delivery_time: 1,
            status_inprocess: 1,
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
  async getOneFromInProcess(payload) {
    const weaving = await SaleDepWeavingCardModel.findOne({ _id: payload.id });
    let ID = new mongoose.Types.ObjectId(weaving.sale_order_id);
    const data = await SaleDepSpinningCardModel.aggregate([
      { $match: { sale_order_id: ID } },
      {
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
    if (data.length > 0) {
      return {
        report: data[0].report.order_report_at_progress,
        sale_order_id: data[0].sale_order_id,
        order_number: data[0].order.order_number,
        customer_name: data[0].order.customer_name,
        quantity: weaving.spinning_yarn_wrap_quantity,
      };
    }
  }

  async addDayReportInProcess(data) {
    let order_report_at_progress = [];
    order_report_at_progress.push(data.items);
    const ID = data.id;
    const Data = await InProcessWeavingModel.findOne({ order_id: ID });
    const newData = Data;
    newData.order_report_at_progress.push(data.items);
    const updateData = await InProcessWeavingModel.findByIdAndUpdate(
      newData._id,
      newData,
      { new: true }
    );
    return updateData;
  }
  async getDayReportFromWeaving(data) {
    let ID = new mongoose.Types.ObjectId(data.id);
    const more_data = await SaleDepPaintCardModel.findOne({
      sale_order_id: data.id,
    });
    const item = await InProcessWeavingModel.aggregate([
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
        order_quantity: more_data.weaving_cloth_quantity,
        delivery_time: more_data.weaving_delivery_time,
        order_number: more_data.order_number,
      };
    }
  }
}

module.exports = new DepWeavingService();
