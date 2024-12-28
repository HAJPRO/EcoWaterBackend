const mongoose = require("mongoose");
const PatoksProcess = require("../../../models/Seam/patoks/Patoks.model");
const ClassificationProcess = require("../../../models/Seam/classification/ClassificationProcess.modal");

class SeamInPatoksService {
  async getAll(is_status) {
    const status = is_status.status;

    try {
      const all_length = await this.getAllLength();
      if (status === 1) {
        const items = await this.getAllInProcess();

        return { items, all_length };
      }
      if (status === 2) {
        const items = await this.AllSentFromClassification();
        return { items, all_length };
      }
      if (status === 3) {
        const items = await this.AllSentToPacking();
        return { items, all_length };
      }
    } catch (error) {
      return error.message;
    }
  }

  async getAllInProcess(id) {
    try {
      let ID = new mongoose.Types.ObjectId(id);
      const allProcess = await PatoksProcess.aggregate([
        { $match: {} },
        {
          $lookup: {
            from: "classificationprocesses",
            localField: "classification_id",
            foreignField: "_id",
            as: "classification_item",
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
            report_box: 1,
            createdAt: 1,
            classification_item: {
              $cond: {
                if: { $isArray: "$classification_item" },
                then: { $arrayElemAt: ["$classification_item", 0] },
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

  async AllSentFromClassification() {
    try {
      const items = await ClassificationProcess.aggregate([
        { $match: { processing: "Patokga yuborildi" } },
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
            report_box: 1,
            createdAt: 1,
            processing: 1,
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
      return items;
    } catch (error) {
      return error.message;
    }
  }
  async AllSentToPacking() {
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
    const form = await ClassificationProcess.findOne({ _id: data.data.id });
    const newData = {
      classification_id: data.data.id,
      author: data.user.id,
      warehouse_id: form.warehouse_id,
    };
    const res = await PatoksProcess.create(newData);
    if (res) {
      const update = await ClassificationProcess.findByIdAndUpdate(
        data.data.id,
        { status: "Patok tasdiqladi", processing: "Patokda" },
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
    const item = await PatoksProcess.findOne({ _id: data.id });
    const newItem = item;
    newItem.report_box.push(data.items);
    const res = await PatoksProcess.findByIdAndUpdate(data.id, newItem, {
      new: true,
    });

    return res;
  }
  async GetOneReport(data) {
    let ID = new mongoose.Types.ObjectId(data.id);
    const res = await PatoksProcess.aggregate([
      { $match: { _id: ID } },
      {
        $lookup: {
          from: "classificationprocesses",
          localField: "classification_id",
          foreignField: "_id",
          as: "classification",
        },
      },

      {
        $project: {
          report_box: 1,
          status: 1,
          processing: 1,
          createdAt: 1,
          classification: {
            $cond: {
              if: { $isArray: "$classification" },
              then: { $arrayElemAt: ["$classification", 0] },
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
    const patok = await PatoksProcess.findOne({ _id: id });

    if (await patok) {
      const item = await ClassificationProcess.findOne({
        _id: patok.classification_id,
      });
      const newData = item;
      newData.report_box[index].status = "Qabul qilindi";
      const updateData = await ClassificationProcess.findByIdAndUpdate(
        patok.classification_id,
        newData,
        {
          new: true,
        }
      );
    }

    return;
  }
}

module.exports = new SeamInPatoksService();
