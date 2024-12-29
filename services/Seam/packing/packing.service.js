const mongoose = require("mongoose");
const PackingProcess = require("../../../models/Seam/packing/Packing.model");
const PatoksProcess = require("../../../models/Seam/patoks/Patoks.model");

class SeamInPackingService {
  async getAll(is_status) {
    const status = is_status.status;

    try {
      const all_length = await this.getAllLength();
      if (status === 1) {
        const items = await this.getAllInProcess();

        return { items, all_length };
      }
      if (status === 2) {
        const items = await this.AllSentFromPatoks();
        return { items, all_length };
      }
      if (status === 3) {
        const items = await this.AllSentToSklad();
        return { items, all_length };
      }
    } catch (error) {
      return error.message;
    }
  }

  async getAllInProcess(id) {
    try {
      let ID = new mongoose.Types.ObjectId(id);
      const allProcess = await PackingProcess.aggregate([
        { $match: {} },
        {
          $lookup: {
            from: "patoksprocesses",
            localField: "patoks_id",
            foreignField: "_id",
            as: "patoks_item",
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
            patoks_item: {
              $cond: {
                if: { $isArray: "$patoks_item" },
                then: { $arrayElemAt: ["$patoks_item", 0] },
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

  async AllSentFromPatoks() {
    try {
      const items = await PatoksProcess.aggregate([
        { $match: { processing: "Upakovkaga yuborildi" } },
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
    const form = await PatoksProcess.findOne({ _id: data.data.id });
    const newData = {
      patoks_id: data.data.id,
      author: data.user.id,
      warehouse_id: form.warehouse_id,
    };
    const res = await PackingProcess.create(newData);
    if (res) {
      const update = await PatoksProcess.findByIdAndUpdate(
        data.data.id,
        { status: "Upakovka tasdiqladi", processing: "Upakovkada" },
        { new: true }
      );
    }
    return res;
  }

  async CreateDayReport(data) {
    const item = await PackingProcess.findOne({ _id: data.id.id });
    const newItem = item;
    newItem.report_box.push(data.items);
    const res = await PackingProcess.findByIdAndUpdate(data.id.id, newItem, {
      new: true,
    });

    return res;
  }
  async GetOneReport(data) {
    let ID = new mongoose.Types.ObjectId(data.id);
    const res = await PackingProcess.aggregate([
      { $match: { _id: ID } },
      {
        $lookup: {
          from: "patoksprocesses",
          localField: "patoks_id",
          foreignField: "_id",
          as: "patoks",
        },
      },

      {
        $project: {
          report_box: 1,
          status: 1,
          processing: 1,
          createdAt: 1,
          patoks: {
            $cond: {
              if: { $isArray: "$patoks" },
              then: { $arrayElemAt: ["$patoks", 0] },
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
    const packing = await PackingProcess.findOne({ _id: id });

    if (await packing) {
      const item = await PatoksProcess.findOne({
        _id: packing.patoks_id,
      });
      const newData = item;
      newData.report_box[index].status = "Qabul qilindi";
      const updateData = await PatoksProcess.findByIdAndUpdate(
        packing.patoks_id,
        newData,
        {
          new: true,
        }
      );
    }

    return;
  }
}

module.exports = new SeamInPackingService();
