const mongoose = require("mongoose");
const OutputFormModel = require("../../../models/Seam/form-warehouse/OutputFormWarehouse.model");
const InputFormModel = require("../../../models/Seam/form-warehouse/InputFormWarehouse.model");
const FormModel = require("../../../models/Seam/form/Form.model");
const OutputForm = require("../../../models/Seam/form/OutputForm.model");
const OutputFormProducts = require("../../../models/Seam/form/OutputFormProducts.model.js");

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
      const allInProcess = await FormModel.find();

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
    let ID = new mongoose.Types.ObjectId(data.data.id);
    const user_id = data.user.id;
    const res = await OutputFormModel.aggregate([
      { $match: { _id: ID } },
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
    const form = await FormModel.find();
    if (res && form.length > 0) {
      const formData = await FormModel.findOne({
        party_number: res[0].warehouse.party_number,
      });
      const inputData = {
        author: user_id,
        form_id: formData._id,
        from_where: res[0].warehouse.in_where,
        quantity: res[0].quantity,
        unit: res[0].unit,
        status: "Qabul qilindi",
      };
      if (formData) {
        const newForm = formData;
        newForm.quantity = newForm.quantity + res[0].quantity;
        const data = await FormModel.findByIdAndUpdate(formData._id, newForm, {
          new: true,
        });
        const input = await InputFormModel.create(inputData);
        const update = await OutputFormModel.findByIdAndUpdate(
          data.data.id,
          { status: "Qabul qilindi" },
          { new: true }
        );
      }
    } else {
      const item = {
        party_number: res[0].warehouse.party_number,
        customer_name: res[0].warehouse.customer_name,
        artikul: res[0].warehouse.artikul,
        material_name: res[0].warehouse.material_name,
        color: res[0].warehouse.color,
        quantity: res[0].quantity,
        unit: res[0].warehouse.unit,
        sort: res[0].warehouse.sort,
      };
      const data = await FormModel.create(item);
    }
  }
  async AddToFormUpdate(id) {
    await AddToFormModel.findByIdAndUpdate(
      id,
      { status: "Bichuv tasdiqladi" },
      { new: true }
    );
  }

  async CreateDayReport(data) {
    const form_id = data.data.id;
    const author = data.user.id;
    const output = {
      pastal_quantity: data.data.items.pastal_quantity,
      head_pack: data.data.items.head_pack,
      waste_quantity: data.data.items.waste_quantity,
      fact_gramage: data.data.items.fact_gramage,
      form_id: data.data.id,
      author: data.user.id,
    };

    const res = await OutputForm.create(output);
    if (await res) {
      data.data.items.products.forEach((item) => {
        const products = {
          output: res._id,
          form_id: data.data.id,
          author: data.user.id,
          ...item,
        };
        OutputFormProducts.create(products);
      });
    }
  }

  async GetOneReport(data) {
    let ID = new mongoose.Types.ObjectId(data.id);
    const info = await FormModel.findOne({ _id: data.id });
    const form = await OutputForm.aggregate([{ $match: { form_id: ID } }]);
    const products = await OutputFormProducts.aggregate([
      { $match: { form_id: ID } },
    ]);

    return { form, products, info };
  }
  async GetOneReportPastal(data) {
    let ID = new mongoose.Types.ObjectId(data.id);
    const form = await OutputForm.aggregate([{ $match: { _id: ID } }]);
    const products = await OutputFormProducts.aggregate([
      { $match: { output: ID } },
    ]);

    return { form, products };
  }
}

module.exports = new SeamInFormService();
