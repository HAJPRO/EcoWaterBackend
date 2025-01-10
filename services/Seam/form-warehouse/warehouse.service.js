const randomstring = require("randomstring");
const output_id = randomstring.generate({
  length: 7,
  charset: ["numeric"],
});

const FormWarehouseModel = require("../../../models/Seam/form-warehouse/FormWarehouse.model");
const SeamRowWarehouseModel = require("../../../models/Seam/warehouse/r-warehouse.model");

class FormWarehouseService {
  async Create(data) {
    console.log(data);
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
  async GetAll(data) {
    const status = data.status;
    try {
      const all_length = await this.getAllLength();
      if (status === 1) {
        const items = await this.AllFromRawWarehouse();
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

  //    async getAllProducts(id) {
  //      let ID = new mongoose.Types.ObjectId(id);
  //      try {
  //        const allInProcess = await AddParamsToFormModel.aggregate([
  //          { $match: {} },
  //          {
  //            $lookup: {
  //              from: "addtoforms",
  //              localField: "warehouse_id",
  //              foreignField: "_id",
  //              as: "warehouse",
  //            },
  //          },
  //          {
  //            $project: {
  //              status: 1,
  //              head_pack: 1,
  //              pastal_quantity: 1,
  //              waste_quantity: 1,
  //              fact_gramage: 1,
  //              createdAt: 1,
  //              warehouse: {
  //                $cond: {
  //                  if: { $isArray: "$warehouse" },
  //                  then: { $arrayElemAt: ["$warehouse", 0] },
  //                  else: null,
  //                },
  //              },
  //            },
  //          },
  //        ]);
  //        return allInProcess;
  //      } catch (error) {
  //        return error.message;
  //      }
  //    }

  async AllFromRawWarehouse() {
    try {
      const items = await SeamRowWarehouseModel.find();
      console.log(items);

      return items;
    } catch (error) {
      return error.message;
    }
  }
}

module.exports = new FormWarehouseService();
