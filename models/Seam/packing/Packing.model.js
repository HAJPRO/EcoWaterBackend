const { model, Schema } = require("mongoose");
const PackingProcessSchema = new Schema(
  {
    author: { type: Schema.ObjectId, ref: "User" },
    patoks_id: { type: Schema.ObjectId, ref: "PatoksProcess" },
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
    },
    state: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = model(" PackingProcess", PackingProcessSchema);
