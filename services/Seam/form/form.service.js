const mongoose = require("mongoose");
const AddToFormModel = require("../../../models/Seam/warehouse/AddToForm.model");
const AddParamsToFormModel = require("../../../models/Seam/form/AddParamsToForm.model");
const { report } = require("process");

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
      const allInProcess = await AddParamsToFormModel.aggregate([
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
      const items = await AddToFormModel.find({ status: "Bichuvga yuborildi" });
      return items;
    } catch (error) {
      return error.message;
    }
  }
  async AllSentToClassification() {
    try {
      const allClassification = await AddParamsToFormModel.aggregate([
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
  async CreaetInfoToForm(payload) {
    const author = payload.user.id;
    const warehouse_id = payload.data.id;
    const head_pack = payload.data.data.head_pack;
    const pastal_quantity = payload.data.data.pastal_quantity;
    const waste_quantity = payload.data.data.waste_quantity;
    const fact_gramage = payload.data.data.fact_gramage;

    const model = {
      author,
      warehouse_id,
      head_pack,
      pastal_quantity,
      waste_quantity,
      fact_gramage,
    };

    const res = await AddParamsToFormModel.create(model);

    if (await res) {
      const updateStatus = await AddParamsToFormModel.findByIdAndUpdate(
        res._id,
        { status: "Jarayonda" },
        { new: true }
      );
      this.AddToFormUpdate(warehouse_id);
    }

    return res;
  }
  async AddToFormUpdate(id) {
    await AddToFormModel.findByIdAndUpdate(
      id,
      { status: "Bichuv tasdiqladi" },
      { new: true }
    );
  }

  async CreateDayReport(data) {
    const item = await AddParamsToFormModel.findOne({ _id: data.id });
    const newItem = item;
    newItem.report_box.push(data.items);
    if (newItem.report_box.length <= 1) {
      newItem.processing = "Tasnifga yuborildi";
      newItem.status = "Tasnifga yuborildi";
    } else {
      newItem.processing = "Tasnifda";
    }

    const res = await AddParamsToFormModel.findByIdAndUpdate(data.id, newItem, {
      new: true,
    });

    return res;
  }
  async GetOneReport(data) {
    let ID = new mongoose.Types.ObjectId(data.id);
    const res = await AddParamsToFormModel.aggregate([
      { $match: { _id: ID } },
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
        },
      },
    ]);
    return res;
  }
}

module.exports = new SeamInFormService();
