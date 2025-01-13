const randomstring = require("randomstring");
const output_id = randomstring.generate({
  length: 7,
  charset: ["numeric"],
});
const mongoose = require("mongoose");
const FormWarehouseModel = require("../../../models/Seam/form-warehouse/FormWarehouse.model");
const SeamRowWarehouseModel = require("../../../models/Seam/warehouse/r-warehouse.model");
const InputSeamFormModel = require("../../../models/Seam/form-warehouse/InputFormWarehouse.model");
const OutputSeamFormModel = require("../../../models/Seam/form-warehouse/OutputFormWarehouse.model");
const OutputSeamModel = require("../../../models/Seam/warehouse/OutputSeamWarehouse.model");

class FormWarehouseService {
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
  async GetAll(data) {
    const status = data.status;
    try {
      const all_length = await this.getAllLength();
      if (status === 1) {
        const items = await this.getAllProducts();
        return { items, all_length };
      }
      if (status === 2) {
        const items = await this.AllFromRawWarehouse();
        return { items, all_length };
      }
    } catch (error) {
      return error.message;
    }
  }

  async getAllProducts(id) {
    let ID = new mongoose.Types.ObjectId(id);
    try {
      const AllProducts = await FormWarehouseModel.find();

      return AllProducts;
    } catch (error) {
      return error.message;
    }
  }

  async AllFromRawWarehouse() {
    try {
      const items = await OutputSeamModel.aggregate([
        {
          $match: {
            status: "Bichuv skladga yuborildi",
          },
        },
        {
          $lookup: {
            from: "warehouserawmaterialforseams",
            localField: "warehouse_id",
            foreignField: "_id",
            as: "warehouse",
          },
        },
        {
          $project: {
            status: 1,
            quantity: 1,
            transactionDateOutput: 1,
            unit: 1,
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
  async AcceptAndCreate(data) {
    let ID = new mongoose.Types.ObjectId(data.data.id);
    const items = await OutputSeamModel.aggregate([
      {
        $match: {
          _id: ID,
        },
      },
      {
        $lookup: {
          from: "warehouserawmaterialforseams",
          localField: "warehouse_id",
          foreignField: "_id",
          as: "warehouse",
        },
      },
      {
        $project: {
          status: 1,
          quantity: 1,
          transactionDateOutput: 1,
          unit: 1,
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

    if (await items) {
      const newData = {
        party_number: items[0].warehouse.party_number,
        customer_name: items[0].warehouse.customer_name,
        quantity: items[0].quantity,
        artikul: items[0].warehouse.artikul,
        material_name: items[0].warehouse.material_name,
        color: items[0].warehouse.color,
        unit: items[0].warehouse.unit,
        sort: items[0].warehouse.sort,
      };
      const matchPartyNumber = await FormWarehouseModel.findOne({
        party_number: items[0].warehouse.party_number,
      });
      if (!matchPartyNumber) {
        const FormWarehouse = await FormWarehouseModel.create(newData);
        if (await FormWarehouse) {
          const inputData = {
            author: data.user.id,
            warehouse_id: FormWarehouse._id,
            quantity: items[0].quantity,
            unit: items[0].unit,
            status: "Bichuv skladi",
            from_where: items[0].warehouse.in_where,
          };
          const input = await InputSeamFormModel.create(inputData);
          const updateOutputSeam = await OutputSeamModel.findByIdAndUpdate(
            ID,
            {
              status: "Qabul qilindi",
            },
            { new: true }
          );
          return { status: 201, msg: "Muvaffaqiyatli tasdiqlandi" };
        }
      } else {
        const inputData = {
          author: data.user.id,
          warehouse_id: matchPartyNumber._id,
          quantity: items[0].quantity,
          unit: items[0].unit,
          status: "Bichuv skladi",
          from_where: items[0].warehouse.in_where,
        };

        const newData = matchPartyNumber;
        newData.quantity = newData.quantity + items[0].quantity;
        const input = await InputSeamFormModel.create(inputData);
        const update = await FormWarehouseModel.findByIdAndUpdate(
          newData._id,
          newData,
          { new: true }
        );

        const updateOutputSeam = await OutputSeamModel.findByIdAndUpdate(
          ID,
          {
            status: "Qabul qilindi",
          },
          { new: true }
        );
        return { status: 201, msg: "Muvaffaqiyatli tasdiqlandi" };
      }
    }
  }
  async GetOne(data) {
    let ID = new mongoose.Types.ObjectId(data.id);
    const warehouse = await FormWarehouseModel.findOne({
      _id: data.id,
    });
    const input = await InputSeamFormModel.find({ warehouse_id: data.id });
    const output = await OutputSeamFormModel.find({ warehouse_id: data.id });
    return { warehouse, input, output };
  }
  async CreateOutput(data) {
    const newModel = {
      author: data.user.id,
      warehouse_id: data.data.model.id,
      to_where: data.data.model.to_where,
      quantity: data.data.model.quantity,
      unit: data.data.model.unit,
      status: data.data.model.to_where + " " + "yuborildi",
    };
    const DataForm = await FormWarehouseModel.findOne({
      _id: data.data.model.id,
    });
    if (
      DataForm.quantity < data.data.model.quantity ||
      data.data.model.quantity < 0
    ) {
      return { status: 404, msg: "Mahsulot yetarli emas" };
    } else {
      const res = await OutputSeamFormModel.create(newModel);
      if (res) {
        const UpdateData = DataForm;
        DataForm.quantity = DataForm.quantity - data.data.model.quantity;
        const UpdateForm = await FormWarehouseModel.findByIdAndUpdate(
          data.data.model.id,
          DataForm,
          { new: true }
        );
      }

      return { msg: "Muvaffaqiyatli yuborildi" };
    }
  }
}

module.exports = new FormWarehouseService();
