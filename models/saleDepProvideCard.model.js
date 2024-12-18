const { Schema, model } = require("mongoose");
const SaleDepProvideCardSchema = new Schema(
  {
    department: { type: String },
    delivery_product_box: { type: Object, required: true },
    author: { type: Schema.ObjectId, ref: "User" },
    status: { type: String, default: "Tasdiqlanmagan" },
    proccess_status: { type: Array },
    state: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = model("DepProvideCard", SaleDepProvideCardSchema);
