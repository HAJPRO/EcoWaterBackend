const { model, Schema } = require("mongoose");

const InputSchema = new Schema(
  {
    author: { type: Schema.ObjectId, ref: "User", required: true },
    warehouse_id: {
      type: Schema.ObjectId,
      ref: "WarehouseRawMaterialForForm",
      required: true,
    },
    from_where: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    status: { type: String, required: true, default: "" },
    transactionDateOutput: { type: Date, default: Date.now },
    state: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

module.exports = model("InputSeamFormWarehouse", InputSchema);
