const { model, Schema } = require("mongoose");
const CWarehouseProcessSchema = new Schema(
  {
    author: { type: Schema.ObjectId, ref: "User" },
    packing_id: { type: Schema.ObjectId, ref: "PackingProcess" },
    warehouse_id: { type: Schema.ObjectId, ref: "AddToForm" },
    status: {
      type: String,
      required: true,
      default: "Skladda",
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

module.exports = model("  CWarehouseProcess", CWarehouseProcessSchema);
