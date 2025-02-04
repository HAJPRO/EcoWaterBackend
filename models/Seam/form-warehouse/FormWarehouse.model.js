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
    order_number: {
      type: String,
    },
    artikul: {
      type: String,
      required: true,
    },
    customer_name: {
      type: String,
      required: true,
    },
    total_quantity: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
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
    input: [
      {
        from_where: { type: String, required: true },
        material_name: { type: String, required: true },
        material_type: { type: String, required: true },
        color: { type: String, required: true },
        quantity: { type: Number, required: true },
        unit: { type: String, required: true },
        status: { type: String, required: true, default: "Kiruvchi" },
        transactionDateInput: { type: Date, default: Date.now },
        state: { type: Boolean, required: true, default: true },
      },
    ],
    output: [
      {
        to_where: { type: String, required: true },
        material_name: { type: String, required: true },
        material_type: { type: String, required: true },
        color: { type: String, required: true },
        quantity: { type: Number, required: true },
        unit: { type: String, required: true },
        status: { type: String, required: true, default: "Chiquvchi" },
        transactionDateOutput: { type: Date, default: new Date() },
        state: { type: Boolean, required: true, default: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = model("FormWarehouse", FormWarehouseSchema);
