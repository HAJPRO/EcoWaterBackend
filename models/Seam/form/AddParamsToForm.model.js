const { model, Schema } = require("mongoose");

const AddParamsToFormSchema = new Schema(
  {
    author: { type: Schema.ObjectId, ref: "User" },
    warehouse_id: { type: Schema.ObjectId, ref: "AddToForm" },
    report_box: { type: Array },
    head_pack: {
      type: Number,
      required: true,
    },
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
    processing: {
      type: String,
      default: "Tasnifga yuborildi",
    },
    state: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = model("AddParamsToForm", AddParamsToFormSchema);
