const mongoose = require("mongoose");
const AddParamsToFormModel = require("../../../models/Seam/form/AddParamsToForm.model");

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
    let ID = new mongoose.Types.ObjectId(id);
    try {
      return;
    } catch (error) {
      return error.message;
    }
  }

  async AllSentFromForm() {
    try {
      const items = await AddParamsToFormModel.aggregate([
        { $match: { processing: "Tasnifga yuborildi" } },

        {
          $project: {
            status: 1,
            pastal_quantity: 1,
            waste_quantity: 1,
            fact_gramage: 1,
            head_pack: 1,
            createdAt: 1,
            processing: 1,
            report: 1,
            report_box: 1,
          },
        },
      ]);
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

  async CreateDayReport(data) {
    const item = await AddParamsToFormModel.findOne({ _id: data.id });
    const newItem = item;
    newItem.report_box.push(data.items);
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
          report_box: 1,
        },
      },
    ]);

    return res;
  }
  async AcceptReportItem(data) {
    const id = data.card_id;
    const index = data.index;
    const item = await AddParamsToFormModel.findOne({ _id: id });
    const newData = item;
    newData.report_box[index].status = "Tasdiqlandi";
    const updateData = await AddParamsToFormModel.findByIdAndUpdate(
      id,
      newData,
      {
        new: true,
      }
    );
    return updateData;
  }
}

module.exports = new SeamInClassificationService();
