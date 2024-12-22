const { model, Schema } = require("mongoose");

const AddToFormSchema = new Schema(
  {
    party_number: {
      type: Number,
      required: true,
    },
    customer_name: {
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
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "Bichuvga yuborildi",
    },
  },
  { timestamps: true }
);

module.exports = model("AddToForm", AddToFormSchema);
