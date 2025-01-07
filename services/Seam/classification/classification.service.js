const mongoose = require("mongoose");
const AddParamsToFormModel = require("../../../models/Seam/form/AddParamsToForm.model");
const ClassificationProcess = require("../../../models/Seam/classification/ClassificationProcess.modal");

class SeamInClassificationService {
  async getAll(is_status) {
    const status = is_status.status;

    try {
      const all_length = await this.getAllLength();
      if (status === 1) {
        const items = await this.getAllInProcess();

        return { items, all_length };
      }
      if (status === 2) {
        const items = await this.AllSentFromForm();
        return { items, all_length };
      }
      if (status === 3) {
        const items = await this.AllSentToPatoks();
        return { items, all_length };
      }
    } catch (error) {
      return error.message;
    }
  }

  async getAllInProcess(id) {
    try {
      let ID = new mongoose.Types.ObjectId(id);
      const allProcess = await ClassificationProcess.aggregate([
        { $match: {} },
        {
          $lookup: {
            from: "addparamstoforms",
            localField: "form_id",
            foreignField: "_id",
            as: "form_item",
          },
        },
        {
          $lookup: {
            from: "addtoforms",
            localField: "warehouse_id",
            foreignField: "_id",
            as: "warehouse",
          },
        },
        {
          $project: {
            status: 1,
            createdAt: 1,
            form_item: {
              $cond: {
                if: { $isArray: "$form_item" },
                then: { $arrayElemAt: ["$form_item", 0] },
                else: null,
              },
            },
            warehouse: {
              $cond: {
                if: { $isArray: "$warehouse" },
                then: { $arrayElemAt: ["$warehouse", 0] },
                else: null,
              },
            },
          },
        },
      ]);
      return allProcess;
    } catch (error) {
      return error.message;
    }
  }

  async AllSentFromForm() {
    try {
      const items = await AddParamsToFormModel.aggregate([
        { $match: { processing: "Tasnifga yuborildi" } },
        {
          $lookup: {
            from: "addtoforms",
            localField: "warehouse_id",
            foreignField: "_id",
            as: "warehouse",
          },
        },

        {
          $project: {
            status: 1,
            pastal_quantity: 1,
            waste_quantity: 1,
            fact_gramage: 1,
            head_pack: 1,
            createdAt: 1,
            processing: 1,
            report_box: 1,
            warehouse: {
              $cond: {
                if: { $isArray: "$warehouse" },
                then: { $arrayElemAt: ["$warehouse", 0] },
                else: null,
              },
            },
          },
        },
      ]);
      console.log(items);

      return items;
    } catch (error) {
      return error.message;
    }
  }
  async AllSentToPatoks() {
    try {
    } catch (error) {
      return error.message;
    }
  }
  async getAllLength() {
    // const process_length = await this.getAllInProcess().then(
    //   (data) => data.length
    // );
    // const warehouse_length = await this.AllSentFromWarehouse().then(
    //   () => data.length
    // );
    // const classification_length = await this.AllSentToClassification().then(
    //   (data) => data.length
    // );
    // return { process_length, warehouse_length, classification_length };
  }
  async ConfirmAndCreteProcess(data) {
    const form = await AddParamsToFormModel.findOne({ _id: data.data.id });
    const newData = {
      form_id: data.data.id,
      author: data.user.id,
      warehouse_id: form.warehouse_id,
    };
    const res = await ClassificationProcess.create(newData);
    if (res) {
      const update = await AddParamsToFormModel.findByIdAndUpdate(
        data.data.id,
        { status: "Tasnif tasdiqladi", processing: "Tasnifda" },
        { new: true }
      );
    }
    return res;
  }
  // async CreaetInfoToForm(payload) {
  //   const author = payload.user.id;
  //   const warehouse_id = payload.data.id;
  //   const head_pack = payload.data.data.head_pack;
  //   const pastal_quantity = payload.data.data.pastal_quantity;
  //   const waste_quantity = payload.data.data.waste_quantity;
  //   const fact_gramage = payload.data.data.fact_gramage;

  //   const model = {
  //     author,
  //     warehouse_id,
  //     head_pack,
  //     pastal_quantity,
  //     waste_quantity,
  //     fact_gramage,
  //   };

  //   const res = await AddParamsToFormModel.create(model);

  //   if (await res) {
  //     const updateStatus = await AddParamsToFormModel.findByIdAndUpdate(
  //       res._id,
  //       { status: "Jarayonda" },
  //       { new: true }
  //     );
  //     this.AddToFormUpdate(warehouse_id);
  //   }

  //   return res;
  // }

  async CreateDayReport(data) {
    const item = await ClassificationProcess.findOne({ _id: data.id });
    const newItem = item;
    newItem.report_box.push(data.items);
    if (newItem.report_box.length <= 1) {
      newItem.processing = "Patokga yuborildi";
      newItem.status = "Patokga yuborildi";
    } else {
      newItem.processing = "Patokda";
    }
    const res = await ClassificationProcess.findByIdAndUpdate(
      data.id,
      newItem,
      {
        new: true,
      }
    );

    return res;
  }
  async GetOneReport(data) {
    let ID = new mongoose.Types.ObjectId(data.id);
    const res = await ClassificationProcess.aggregate([
      { $match: { _id: ID } },
      {
        $lookup: {
          from: "addparamstoforms",
          localField: "form_id",
          foreignField: "_id",
          as: "form",
        },
      },

      {
        $project: {
          report_box: 1,
          status: 1,
          form: {
            $cond: {
              if: { $isArray: "$form" },
              then: { $arrayElemAt: ["$form", 0] },
              else: null,
            },
          },
        },
      },
    ]);

    return res;
  }
  async AcceptReportItem(data) {
    const id = data.card_id;
    const index = data.index;
    const form = await ClassificationProcess.findOne({ _id: id });

    if (await form) {
      const item = await AddParamsToFormModel.findOne({ _id: form.form_id });
      const newData = item;
      newData.report_box[index].status = "Qabul qilindi";
      const updateData = await AddParamsToFormModel.findByIdAndUpdate(
        form.form_id,
        newData,
        {
          new: true,
        }
      );
    }

    return;
  }
}

module.exports = new SeamInClassificationService();
