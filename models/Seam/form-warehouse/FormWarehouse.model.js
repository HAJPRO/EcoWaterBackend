const { model, Schema } = require("mongoose");

const FormWarehouseSchema = new Schema(
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
      default: "Skladda",
    },
    in_where: {
      type: String,
      required: true,
      default: "Bichuv skladi",
    },
  },
  { timestamps: true }
);

module.exports = model("FormWarehouse", FormWarehouseSchema);
