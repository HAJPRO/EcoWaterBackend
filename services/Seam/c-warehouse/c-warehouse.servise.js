const mongoose = require("mongoose");
const PackingProcess = require("../../../models/Seam/packing/Packing.model");
const CWarehouseProcess = require("../../../models/Seam/c-warehouse/C-Warehouse.model");

class SeamInCWarehouseService {
  async getAll(is_status) {
    const status = is_status.status;

    try {
      const all_length = await this.getAllLength();
      if (status === 1) {
        const items = await this.getAllInProcess();

        return { items, all_length };
      }
      if (status === 2) {
        const items = await this.AllSentFromPacking();
        return { items, all_length };
      }
    } catch (error) {
      return error.message;
    }
  }

  async getAllInProcess(id) {
    try {
      let ID = new mongoose.Types.ObjectId(id);
      const allProcess = await CWarehouseProcess.aggregate([
        { $match: {} },
        {
          $lookup: {
            from: "packingprocesses",
            localField: "packing_id",
            foreignField: "_id",
            as: "packing",
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
            warehouse: {
              $cond: {
                if: { $isArray: "$warehouse" },
                then: { $arrayElemAt: ["$warehouse", 0] },
                else: null,
              },
            },
            packing: {
              $cond: {
                if: { $isArray: "$packing" },
                then: { $arrayElemAt: ["$packing", 0] },
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

  async AllSentFromPacking() {
    try {
      const items = await PackingProcess.aggregate([
        {
          $match: { processing: "Skladga yuborildi" },
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
  async ConfirmAndCreateInProcess(data) {
    const packing = await PackingProcess.findOne({ _id: data.data.id });
    const newData = {
      packing_id: data.data.id,
      author: data.user.id,
      warehouse_id: packing.warehouse_id,
    };
    const res = await CWarehouseProcess.create(newData);
    if (res) {
      const update = await PackingProcess.findByIdAndUpdate(
        data.data.id,
        { status: "Sklad tasdiqladi", processing: "Skladda" },
        { new: true }
      );
    }
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
    const id = data.card_id;
    const index = data.index;
    const packing = await PackingProcess.findOne({ _id: id });

    if (await packing) {
      const newData = packing;
      newData.report_box[index].status = "Qabul qilindi";
      const updateData = await PackingProcess.findByIdAndUpdate(id, newData, {
        new: true,
      });
    }
  }

  return;
}

module.exports = new SeamInCWarehouseService();
