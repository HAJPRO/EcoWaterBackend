const mongoose = require("mongoose");
const OutputFormModel = require("../../../models/Seam/form-warehouse/OutputFormWarehouse.model");
const FormModel = require("../../../models/Seam/form/Form.model");

class SeamInFormService {
  async getAll(is_status) {
    const status = is_status.status;

    try {
      const all_length = await this.getAllLength();
      if (status === 1) {
        const items = await this.getAllInProcess();

        return { items, all_length };
      }
      if (status === 2) {
        const items = await this.AllSentFromWarehouse();
        return { items, all_length };
      }
      if (status === 3) {
        const items = await this.AllSentToClassification();
        return { items, all_length };
      }
    } catch (error) {
      return error.message;
    }
  }

  async getAllInProcess(id) {
    let ID = new mongoose.Types.ObjectId(id);
    try {
      const allInProcess = await FormModel.aggregate([
        { $match: {} },
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
            head_pack: 1,
            pastal_quantity: 1,
            waste_quantity: 1,
            fact_gramage: 1,
            createdAt: 1,
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
      return allInProcess;
    } catch (error) {
      return error.message;
    }
  }

  async AllSentFromWarehouse() {
    try {
      const items = await OutputFormModel.aggregate([
        {
          $match: {
            status: "Bichuvga yuborildi",
          },
        },
        {
          $lookup: {
            from: "formwarehouses",
            localField: "warehouse_id",
            foreignField: "_id",
            as: "warehouse",
          },
        },
        {
          $project: {
            status: 1,
            to_where: 1,
            quantity: 1,
            unit: 1,
            transactionDateOutput: 1,
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
  async AllSentToClassification() {
    try {
      const allClassification = await FormModel.aggregate([
        {
          $match: {
            $and: { processing: "Tasnifga yuborildi" },
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
            head_pack: 1,
            pastal_quantity: 1,
            waste_quantity: 1,
            fact_gramage: 1,
            processing: 1,
            createdAt: 1,
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

      return allClassification;
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
  async AcceptAndCreate(data) {
    console.log(data);
  }
  async AddToFormUpdate(id) {
    await AddToFormModel.findByIdAndUpdate(
      id,
      { status: "Bichuv tasdiqladi" },
      { new: true }
    );
  }

  async CreateDayReport(data) {
    const item = await FormModel.findOne({ _id: data.id });
    const newItem = item;
    newItem.report_box.push(data.items);
    if (newItem.report_box.length <= 1) {
      newItem.processing = "Tasnifga yuborildi";
      newItem.status = "Tasnifga yuborildi";
    }

    const res = await FormModel.findByIdAndUpdate(data.id, newItem, {
      new: true,
    });

    return res;
  }
  async GetOneReport(data) {
    let ID = new mongoose.Types.ObjectId(data.id);
    const res = await FormModel.aggregate([
      { $match: { _id: ID } },
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
          report: 1,
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
    return res;
  }
}

module.exports = new SeamInFormService();
