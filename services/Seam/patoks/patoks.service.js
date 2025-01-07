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
    const classification = await ClassificationProcess.findOne({
      _id: data.data.id,
    });

    const newData = {
      classification_id: data.data.id,
      author: data.user.id,
      warehouse_id: classification.warehouse_id,
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

  async CreateDayReport(data) {
    const item = await PatoksProcess.findById(data.id.id);
    const newItem = item;
    newItem.patoks_process.push(data.items);
    if (newItem.report_box.length <= 1) {
      newItem.processing = "Upakovkaga yuborildi";
      newItem.status = "Upakovkaga yuborildi";
    } else {
      newItem.processing = "Upakovkada";
    }
    const res = await PatoksProcess.findByIdAndUpdate(data.id.id, newItem, {
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
        $lookup: {
          from: "addtoforms",
          localField: "warehouse_id",
          foreignField: "_id",
          as: "warehouse",
        },
      },

      {
        $project: {
          report_box: 1,
          patoks_process: 1,
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
    return res;
  }
  async AcceptReportItem(data) {
    const id = data.card_id.id;
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
  }
  async AcceptFromPatok(data) {
    const id = data.card_id.id;
    const index = data.index;
    const patok = await PatoksProcess.findOne({ _id: id });
    const patokNew = patok;
    const process_item = patokNew.patoks_process[index];
    const report_box = {
      status: "Upakovkaga yuborildi",
      date: new Date(),
      model_name: process_item.model_name,
      quantity: process_item.quantity,
      unit: process_item.unit,
      id: process_item.id,
    };
    patokNew.report_box.push(report_box);
    patokNew.patoks_process[index].status = "Qabul qilindi";
    patokNew.processing = "Upakovkaga yuborildi";
    const update = await PatoksProcess.findByIdAndUpdate(id, patokNew, {
      new: true,
    });
  }
}

module.exports = new SeamInPatoksService();
