const { model, Schema } = require("mongoose");

const WarehouseRawMaterialForSeamSchema = new Schema(
  {
    author: { type: Schema.ObjectId, ref: "User" },
    order_number: {
      type: String,
      required: true,
    },
    party_number: {
      type: String,
    },
    customer_name: {
      type: String,
      required: true,
    },
    artikul: {
      type: String,
      required: true,
    },
    input: [
      {
        id: { type: String },
        material_name: { type: String },
        material_type: { type: String },
        width: { type: Number },
        grammage: { type: Number },
        color: { type: String },
        quantity: { type: Number },
        unit: { type: String },
        status: { type: String, default: "Tasdiqlanmagan" },
        state: { type: Boolean, default: true },
        in_where: { type: String, default: "Tikuv skladida" },
        sent_time: { type: Date, default: new Date() },
      },
    ],
    output: [
      {
        id: { type: String },
        material_name: { type: String },
        material_type: { type: String },
        width: { type: Number },
        grammage: { type: Number },
        color: { type: String },
        quantity: { type: Number },
        unit: { type: String },
        status: { type: String, default: "Tasdiqlanmagan" },
        state: { type: Boolean, default: true },
        in_where: { type: String },
        sent_time: { type: Date, default: new Date() },
      },
    ],
    quantity: {
      type: Number,
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
