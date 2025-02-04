const { model, Schema } = require("mongoose");

const AddToFormSchema = new Schema(
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
    material_name: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    material_type: {
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

module.exports = model("AddToForm", AddToFormSchema);
