const { model, Schema } = require("mongoose");

const AddParamsToFormSchema = new Schema(
  {
    pastal_quantity: {
      type: Number,
      required: true,
    },
    waste_quantity: {
      type: Number,
      required: true,
    },
    fact_gramage: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      required: true,
      default: "Jarayonda",
    },
  },
  { timestamps: true }
);

module.exports = model("AddParamsToForm", AddParamsToFormSchema);
