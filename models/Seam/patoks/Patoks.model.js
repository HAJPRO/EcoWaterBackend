const { model, Schema } = require("mongoose");
const PatoksProcessSchema = new Schema(
  {
    author: { type: Schema.ObjectId, ref: "User" },
    classification_id: { type: Schema.ObjectId, ref: "ClassificationProcess" },
    warehouse_id: { type: Schema.ObjectId, ref: "AddToForm" },
    report_box: {
      type: Array,
      default: [],
      required: true,
    },

    status: {
      type: String,
      required: true,
      default: "Jarayonda",
    },
    processing: {
      type: String,
      required: true,
      default: "Upakovkaga yuborildi",
    },
    state: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = model("PatoksProcess", PatoksProcessSchema);
