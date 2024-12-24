const { model, Schema } = require("mongoose");

const AddParamsToFormSchema = new Schema(
  {
    author: { type: Schema.ObjectId, ref: "User" },
    warehouse_id: { type: Schema.ObjectId, ref: "AddToForm" },
    procces_box: { type: Schema.ObjectId, ref: "AddToForm" },
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
