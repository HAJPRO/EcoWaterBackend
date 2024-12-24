const { model, Schema } = require("mongoose");

const AddToFormSchema = new Schema(
  {
    party_number: {
      type: String,
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
      type: String,
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
