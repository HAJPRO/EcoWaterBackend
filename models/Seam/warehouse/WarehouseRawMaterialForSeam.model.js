const { model, Schema } = require("mongoose");

const WarehouseRawMaterialForSeamSchema = new Schema(
  {
    author: { type: Schema.ObjectId, ref: "User" },
    party_number: {
      type: String,
      required: true,
    },
    customer_name: {
      type: String,
      required: true,
    },
    artikul: {
      type: String,
      required: true,
    },
    material_name: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    // input: {
    //   type: Array,
    //   default: [],
    // },
    // output: {
    //   type: Array,
    //   default: [],
    // },
    quantity: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    sort: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      required: true,
      default: "Tasdiqlangan",
    },
    state: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = model(
  "WarehouseRawMaterialForSeam",
  WarehouseRawMaterialForSeamSchema
);
